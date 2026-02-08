import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  Name: String,
  Email: { type: String, unique: true },
  PhoneNo: {type:String,unique:true},
  Password: String,
  Country: String,
  Address: String,

  emailOtp: String,
  emailOtpExpires: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // ⏱ auto-delete after 5 minutes
  }
});

export default mongoose.model("TempStudent", tempUserSchema);