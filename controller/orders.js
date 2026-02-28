import Order from '../model/orders.js'
import customImage from '../model/CustomImage.js';
import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto"

const RUSH_FEE = Number(process.env.RUSH_FEE) || 20000;

// // Basic male-name validation list (expand anytime)
// const maleNames = ["john", "michael", "david", "james", "daniel"];

// ✅ Create Order Controller
export const createOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      ageGroup,
      price,
      basePrice,
      selectedCard,
      cardImage,
      deliveryDate,
      message
    } = req.body;

    // 1️⃣ Validate Required Fields
    if (!name || !email || !ageGroup || !basePrice || !deliveryDate || !message) {
      return res.status(400).json({
        message: "All required fields must be filled."
      });
    }

    // // 2️⃣ Male Only Validation
    // const firstName = name.split(" ")[0].toLowerCase();
    // if (!maleNames.includes(firstName)) {
    //   return res.status(400).json({
    //     message: "Only male customer names are allowed."
    //   });
    // }

     if (isNaN(new Date(deliveryDate))) {
      return res.status(400).json({ message: "Invalid delivery date" });
    }

    // 3️⃣ Rush Fee Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(deliveryDate);
    selectedDate.setHours(0,0,0,0);
    // Minimum allowed date = today + 2 days
const minimumDate = new Date(today);
minimumDate.setDate(minimumDate.getDate() + 2);

if (selectedDate < minimumDate) {
  return res.status(400).json({
    message: "Delivery date must be at least 2 days from today"
  });
}
    // const diffTime=(selectedDate - today);

    const differenceInDays =
      (selectedDate - today) / (1000 * 60 * 60 * 24);

    let finalPrice = Number(basePrice);
    let isRush = false;

    if (differenceInDays <= 5) {
      finalPrice += RUSH_FEE;
      isRush = true;
    };

//     console.log({
//   rawDays: diffTime / (1000 * 60 * 60 * 24),
//   floor: Math.floor(diffTime / (1000 * 60 * 60 * 24)),
//   ceil: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
// });

console.log(req.user);
    // ✅ Generate Unique Payment Reference
//     const userId = req.user?._id;
// if (!userId) {
//   return res.status(400).json({ error: "User ID is missing" });
// }
    const paymentReference = `ORD-${uuidv4()}`;

    // 4️⃣ Save Order
    const newOrder = new Order({
      user: req.user._id, // comes from token
      name,
      email,
      ageGroup,
      price,
      basePrice,
      finalPrice,
      selectedCard,
      cardImage,
      deliveryDate,
      message,
      isRush,
       paymentReference,
      paymentStatus: "pending"
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order submitted successfully",
      order:newOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
      console.log(error.message||error)
  }
  };


  export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: "Payment reference required" });
    }
console.log(reference);
    const order = await Order.findOne({ paymentReference: reference });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
console.log(order)
    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        message: "Order already verified",
        order
      });
    }

    // 🔐 Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;
    console.log("Paystack data:", paymentData);

// 1️⃣ First check: was transaction successful at Paystack?
if (paymentData.status !== "success") {
  return res.status(400).json({
    message: "Payment not successful"
  });
}

    // // ✅ Security Check
    // if (
    //   paymentData.status === "success" &&
    //   paymentData.amount === order.finalPrice * 100
    // ) 
    
    
// 2️⃣ Security checks
if (
  Number(paymentData.amount) !== Math.round(Number(order.finalPrice) * 100) ||
  paymentData.reference !== order.paymentReference ||
  paymentData.currency !== "NGN"
) {
  return res.status(400).json({
    message: "Payment verification failed (mismatch detected)"
  });
}

      order.paymentStatus = "paid";
      order.paymentData = paymentData;
      order.status="Payment Confirmed",
      order.progress=25
      await order.save();

      return res.status(200).json({
        message: "Payment verified successfully",
        order
      });
    

    
    } catch (error) {
    console.error("Payment verification error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};


export const paystackWebhook = async (req, res) => {
  try {
    // 1. Verify the signature (Security Check)
    // Paystack sends a header 'x-paystack-signature' to prove it's them
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    // 2. Retrieve the event data
    const event = req.body;

    // 3. Listen for the 'charge.success' event
    if (event.event === "charge.success") {
      const { reference, amount } = event.data;

      const order = await Order.findOne({ paymentReference: reference });

      if (order && order.paymentStatus !== "paid") {
        // Double check the amount (Paystack sends amount in Kobo)
        const expectedAmount = Math.round(Number(order.finalPrice) * 100);
        
        if (amount === expectedAmount) {
          order.paymentStatus = "paid";
          order.paymentData = event.data;
          order.status = "Processing";
          await order.save();
          console.log(`Webhook: Order ${reference} updated to PAID`);
        }
      }
    }

    // 4. Always send a 200 OK to Paystack
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
};

  export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { status, progress } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });

    order.status = status;
    order.progress = progress;

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const order = await Order.findOne({ paymentReference: reference });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.user._id:", req.user?._id);
     if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not attached properly" });
      return next(error);
    }

    // const userId = orders.user.$oid;
    // const userId = req.user._id;
    // req.user is set by your auth middleware
    const orders = await Order.find({user: req.user._id}).sort({ createdAt: -1 }).populate("user", "name email ageGroup deliveryDate status progress");;
    return res.status(200).json(orders); // always an array
    // if (!orders.length) {
    //   return res.status(404).json({ message: "No orders found" });
    // }

  } catch (error) {
    console.error("getMyOrders error:", error);
    res.status(500).json({ message: "Server error" });
    next(error);
  }
};


export const saveCustomImage = async (req, res) => {
  try {
    const { imageUrl, message } = req.body;

    if (!imageUrl || !message) {
      return res.status(400).json({
        success: false,
        message: "Image URL and message are required"
      });
    }

    const newImage = await customImage.create({
      imageUrl,
      message,
      price: null,
      status: "awaiting_details",
      customerDetails: null
    });

    // Run price calculation in background
    calculateBasePrice(newImage._id);

    return res.status(201).json({
      success: true,
      customImageId: newImage._id,
    });

  } catch (error) {
    console.error("Save Custom Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const calculateBasePrice = async (imageId) => {
  try {
    // Simulate heavy logic (AI / admin decision / etc.)
    await new Promise(resolve => setTimeout(resolve, 5000));

    const basePrice = 50000; // example logic

    await customImage.findByIdAndUpdate(imageId, {
      price:basePrice,
      status: "ready"
    });

  } catch (err) {
    console.error("Price Calculation Failed:", err);
    await customImage.findByIdAndUpdate(imageId, {
      status: "failed"
    });
  }
};

export const saveCustomerDetails = async (req, res) => {
  console.log('Request received for /save-details/:id');
  try {
    const { id } = req.params;
    const details = req.body;

    const image = await customImage.findById(id);

    if (!image) {
      return res.status(404).json({ success: false });
    }

    if (image.status !== "awaiting_details") {
      return res.status(400).json({
        success: false,
        message: "Details already submitted"
      });
    }

     // 3️⃣ Rush Fee Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(deliveryDate);
    selectedDate.setHours(0,0,0,0);
    // Minimum allowed date = today + 2 days
const minimumDate = new Date(today);
minimumDate.setDate(minimumDate.getDate() + 2);

if (selectedDate < minimumDate) {
  return res.status(400).json({
    message: "Delivery date must be at least 2 days from today"
  });
}
    // const diffTime=(selectedDate - today);

    const differenceInDays =
      (selectedDate - today) / (1000 * 60 * 60 * 24);

    let finalPrice = Number(basePrice);
    let isRush = false;

    if (differenceInDays <= 5) {
      finalPrice += RUSH_FEE;
      isRush = true;
    };

    image.customerDetails = details;
    image.status = "pending_payment";
  

    await image.save();

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const getCustomImages = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await customImage.findById(id);
    // const images = await customImage.find().sort({ createdAt: -1 });

    // res.status(200).json({
    //   success: true,
    //   data: images
    // });

     // Send the relevant info for frontend polling
    return res.json({ success: true, order: {
      status: image.status,
      price: image.price,
      finalPrice: image.finalPrice || image.price
    }});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch images"
    });
  }
};