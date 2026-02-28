import mongoose from "mongoose"


const orderSchema = new mongoose.Schema({
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
  name: { type: String, required: true },
  email: { type: String, required: true },
  ageGroup: { type: String, required: true },
  price:{type:String},
  basePrice: { type: Number, required: true },
  finalPrice: { type: Number, required: true,validate: {
      validator: function(value) {
        return value >= this.basePrice;
      },
      message: "finalPrice cannot be less than basePrice"
    } },
  selectedCard: { type: String, required: true },
  cardImage: { type: String },
  deliveryDate: { type: Date, required: true },
  message: { type: String, required: true },
  isRush: { type: Boolean, default: false },

   paymentReference: { type: String, unique: true },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  paymentData: { type: Object },

   // 🔥 NEW PROGRESS FIELDS
  progress: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: [
      "Pending Payment",
      "Processing",
      "Payment Confirmed",
      "Cutting",
      "Sewing",
      "Ready for Pickup"
    ],
    default: "Pending Payment"
  }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order