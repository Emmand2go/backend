import express from "express"
import {createOrder, getCustomImages, getMyOrder, getOrderByReference, getSingleOrder, paystackWebhook, saveCustomerDetails, saveCustomImage, updateProgress, verifyPayment,} from "../controller/orders.js";
import {protect} from "../authguard/authguard.js"

const Oroute=express.Router();
Oroute.post("/", protect ,createOrder);
Oroute.post("/verify",verifyPayment);
Oroute.get("/:id",getSingleOrder);
Oroute.put("/:id/progress",updateProgress);
Oroute.post("/webhook", paystackWebhook);
Oroute.get("/getorders", protect ,getMyOrder);
Oroute.get("/orders/reference/:reference", getOrderByReference);

Oroute.post("/custom-image",saveCustomImage);
Oroute.put("/save-details/:id",saveCustomerDetails);
Oroute.get("/custom-image/:id", getCustomImages);
// Oroute.get("/save-details/:id",saveCustomImage)
// Oroute.post("/getorders",protect,getMyOrder, (req, res) => {
//   console.log("Route hit!");
//   res.send("ok");
// });


export default Oroute