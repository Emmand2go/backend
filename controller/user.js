import stave from "../model/user.js"
import bcrypt, { compare } from "bcryptjs"
import jwt from "jsonwebtoken"
// const jwt = require('jsonwebtoken');
import TempStudent from "../model/tempUser.js";
import crypto from "crypto";
import Brevo from "@getbrevo/brevo"
import { sendotpEmail } from "../utilis/brevo.js";
// import SibApiV3Sdk from "sib-api-v3-sdk"
import dotenv from "dotenv"
import sendReset from "../utilis/reset-paswrd.js";
dotenv.config();


// create
// export const CreateStudents= async(req, res)=>{
//     const { Name,PhoneNo, Password, Country, Address, } = req.body;
//     const Email = req.body.Email.toLowerCase();
//     try{
//         const exist=await stave.findOne({Email})
//         if (exist) return res.status(400).json({message:"Email Already Exist"});
//             const phone=await stave.findOne({PhoneNo})
//         if (phone) return res.status(400).json({message:"Phone no Already Exist"});
// // Create user with hashedpassword
//         const salt = await bcrypt.genSalt(10);
// const hashedpassword = await bcrypt.hash(Password, salt);
//             const Students=await stave.create({Name,Email,PhoneNo,Password:hashedpassword,
//         Country,Address})
//         return res.status(201).json({message:"Registration Successful",Students})
//     }catch (error){console.error(error)
//         res.status(500).json({message:"Server Error",error})
//     }
// }


export const CreateStudents = async (req, res) => {
  const { Name, PhoneNo, Password, Country, Address } = req.body;
  const Email = req.body.Email?.toLowerCase();
  
  if (!Password || Password.length < 6) {
  return res.status(400).json({
    error: "Password must be at least 6 characters long"
  });
}

  try {
    console.log("STAVE MODEL:", !!stave);
    console.log("REGISTER BODY:", req.body);
    console.log("My Key is:", process.env.BREVO_API_KEY);
    
    // Check real users
    if (await stave.findOne({ Email }))
      return res.status(400).json({ message: "Email already exists" });

    if (await stave.findOne({ PhoneNo }))
      return res.status(400).json({ message: "Phone no already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(Password, salt);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

        // Check if there is an existing temp user record for this email
    const existingTempStudent = await TempStudent.findOne({ Email});

    if (existingTempStudent) {
      // If OTP expired, delete the old record and generate a new one
      if (Date.now() > existingTempStudent.emailOtpExpires) {
        await TempStudent.deleteOne({ Email});
        console.log("Old OTP expired, deleting record and generating new OTP");
      } else {
        return res.status(400).json({
          message: "OTP already sent. Please verify your email."
        });
      }
    }

    // Save TEMP student (upsert = resend OTP case)
    await TempStudent.findOneAndUpdate(
      { Email },
      {
        Name,
        Email,
        PhoneNo,
        Password: hashedpassword,
        Country,
        Address,
        emailOtp: hashedOtp,
        emailOtpExpires: Date.now() + 5 * 60 * 1000
      },
      { upsert: true, returnDocument:'after',setDefaultsOnInsert: true }
    );

    // // ✅ Setup Brevo client here
    // const defaultClient = SibApiV3Sdk.ApiClient.instance;
    // defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
    // const brevoEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    // // ✅ Setup Brevo client
    // const brevoEmailApi = new Brevo.TransactionalEmailsApi();
    // brevoEmailApi.setApiKey(
    //   Brevo.TransactionalEmailsApiApiKeys.apiKey,
    //   process.env.BREVO_API_KEY
    // );

     // 📧 Send OTP (isolated so it can't crash server)
     // await brevoEmailApi.sendTransacEmail(Email,otp);
    try {
      await sendotpEmail(Email, otp);
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError.message);
      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    return res.status(200).json({
      message: "OTP sent to email. Please verify to complete registration"
    });
    
  } catch (error) {
    console.error("Full Error", error);
    
    console.error(error);
    res.status(500).json({ message: error.message,stack:error.stack });
  }
};

export const VerifyUserEmail = async (req, res) => {
  const { Email, otp } = req.body;
  console.log("--- Verification Start ---");
  console.log("Received Email:", Email);
  console.log("Received OTP:", otp);

  try {
    // const tempStudent = await TempStudent.findOne({ Email});

    // if (!tempStudent)
    //   return res.status(400).json({ message: "OTP expired or invalid" });

    // if (Date.now() > tempStudent.emailOtpExpires)
    //   return res.status(400).json({ message: "OTP expired" });
    // 1. Find the temporary record
    const tempStudent = await TempStudent.findOne({ Email});
    console.log("TempUser Found?:", !!tempStudent);

    if (!tempStudent)
      return res.status(400).json({ message: "No registration in progress for this email" });

    // 2. Check if expired
    if (Date.now() > tempStudent.emailOtpExpires) {
      await TempStudent.deleteOne({ Email }); // Clean up expired record
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }
    console.log("Current Time: ", Date.now());
  console.log("Expiry Time:  ", tempStudent.emailOtpExpires);
  console.log("Is Expired?:  ", Date.now() > tempStudent.emailOtpExpires);

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

      console.log("Hashed Input OTP:", hashedOtp);
  console.log("Stored OTP Hash: ", tempStudent.emailOtp);
  console.log("Match Status:    ", hashedOtp === tempStudent.emailOtp);

    if (hashedOtp !== tempStudent.emailOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    // Create REAL student
    const student = await stave.create({
      Name: tempStudent.Name,
      Email: tempStudent.Email,
      PhoneNo: tempStudent.PhoneNo,
      Password: tempStudent.Password,
      Country: tempStudent.Country,
      Address: tempStudent.Address,
      emailConfirmed: true
    });

    // Delete temp record
    await TempStudent.deleteOne({ Email });

    res.status(201).json({
      message: "Email verified. Registration completed",
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Get all user and by id
export const getAllStudents = async(req,res)=>{
    try{let Students=await stave.find() //.select('-Email')
        res.status(200).json(Students)
    }catch(error){res.status(500).json({message:'Server Error',error})}
}
export const getUserById=async(req,res)=>{
    const userId=req.params.id
try{const user=await stave.findById(userId) //.select('-Password')
    if (!user) return res.status(404).json({message:'user Not Found'})
        res.status(200).json(user)
}catch(error){res.status(500).json({message:error.message})}
}

// Login user
export const LoginUser= async(req,res)=>{
    const {Password}=req.body
    const Email = req.body.Email.toLowerCase();
    try{
      console.log("Is JWT loaded?", !!jwt);
        const user =await stave.findOne({Email});
        if(!user) return res.status(404).json({message:"Email Not Registered"})
    //         if (Password !== user.Password) {
    // return res.status(400).json({ message: "Incorrect password" })}
   const isMatch= await compare(Password,user.Password)
if(!isMatch) return res.status(404).json({message:"Incorrect password"});
const token=jwt.sign({id:user._id},
    process.env.SECRET_KEY,{expiresIn:"3m"})
    res.status(200).json({message:"Login Successful",token,
        user:{id:user._id,Name:user.Name,Email:user.Email,PhoneNo:user.PhoneNumber,Country:user.Country,Address:user.Address}
    })    
    }catch(error){res.status(500).json({message:error.message})}
}
//Update user
export const updateUser=async(req,res)=>{let userId=req.params.id
    const {Name, Email, PhoneNo, Password, Country, Address}=req.body
    try{let user=await stave.findByIdAndUpdate(userId)
        if(!user) return res.status(404).json({message:"User Not Found"})
            // Update only if provided
         user.Name = Name || user.Name;
        user.Email = Email || user.Email;
        user.PhoneNo = PhoneNo || user.PhoneNo;
        user.Country = Country || user.Country;
        user.Address = Address || user.Address;
        await user.save()
        return res.status(200).json({
            message: "User successfully updated",
           updatedUser: {
                id: user._id,
                Name: user.Name,
                Email: user.Email,
                PhoneNo: user.PhoneNo,
                Country: user.Country,
                Address: user.Address
            }
        });
    }catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}
//delete user
export const deleteUser=async(req,res)=>{const userId=req.params.id
    try{const user=await stave.findById(userId)
        if(!user) return res.status(404).json({message:'User does not exist'})
            await user.deleteOne(); res.status(200).json({message:"User deleted succesfully"})
    }catch(error){res.staus(500).json({message:"Server Error"})}

}

// Reset password
export const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await stave.findOne({ Email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // Create reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
console.log("Frontend URL:", process.env.FRONTEND_URL);
    // Email content
    const message = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.Name},</p>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset it (expires in 15 minutes):</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await sendReset({ to: user.Email, subject: "Password Reset", html: message });

    res.json({ message: "Reset link sent to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log("Token received:", token);
//if it shows this incorrect:7dd033aa27dbbd1545db49be01d4e8fd113cacf466a291b3766d26fd7810fec5]Reset Password, correct one is only the no    

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log("Hashed token:", hashedToken);

    const user = await stave.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.Password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};