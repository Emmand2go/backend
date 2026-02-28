import express from "express"
import {createOrder, getCustomImages, getMyOrders, getOrderByReference, getSingleOrder, paystackWebhook, saveCustomerDetails, saveCustomImage, updateProgress, verifyPayment,} from "../controller/orders.js";
import {protect} from "../authguard/authguard.js"

const Oroute=express.Router();
Oroute.post("/", protect ,createOrder);
Oroute.post("/verify",verifyPayment);
Oroute.get("/:id",getSingleOrder);
Oroute.put("/:id/progress",updateProgress);
Oroute.post("/webhook", paystackWebhook);
Oroute.get("/orders/reference/:reference", getOrderByReference);
Oroute.get("/getorders",getMyOrders);
Oroute.post("/custom-image",saveCustomImage);
Oroute.put("/save-details/:id",saveCustomerDetails);
Oroute.get("/custom-image/:id", getCustomImages);
Oroute.get("/save-details/:id",saveCustomImage)
// Oroute.get("/getorders",protect, getMyOrders, (req, res) => {
//   console.log("Route hit!");
//   res.send("ok");
// });


export default Oroute