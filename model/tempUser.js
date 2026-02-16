import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  Name: String,
  Email: { type: String, unique: false },
  PhoneNo: {type:String,unique:false},
  Password: { type: String, required: true },
  Country: String,
  Address: String,

  emailOtp: String,
emailOtpExpires: { type: Date, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
    // Set this slightly longer than the OTP expiry to prevent 
    // the user from getting deleted while the server is processing their request.
    expires: 600 // ⏱ auto-delete after 10 minutes
  }
});

const TempUser = mongoose.model("TempUser", tempUserSchema);
export default TempUser;