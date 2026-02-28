import mongoose from "mongoose";

const customerDetailsSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  ageGroup: {
    type: String,
    enum: ["toddler", "child", "teenager", "adult"],
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
}, { _id: false });


const customImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  price: {
    type: String,
    required: false,
    default:null
  },

  finalPrice: { type: String, required: false},

  customerDetails: {
    type: customerDetailsSchema,
    default: null
  },

  status: {
    type: String,
    enum: [
      "awaiting_details",
      "pending_payment",
      "paid",
      "processing",
      "completed",
      "cancelled",
      "ready",
      "failed",
    ],
    default: "awaiting_details"
  }

}, { timestamps: true });

export default mongoose.model("customImage", customImageSchema);