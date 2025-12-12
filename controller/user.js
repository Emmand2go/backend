import stave from "../model/user.js"
import bcrypt, { compare } from "bcryptjs"
import jwt from "jsonwebtoken"


// create
export const CreateStudents= async(req, res)=>{
    const { Name, Email, PhoneNo, Password, Country, Address } = req.body;
    try{
        const exist=await stave.findOne({Email})
        if (exist) return res.status(400).json({message:"Email Already Exist"});
            const phone=await stave.findOne({PhoneNo})
        if (phone) return res.status(400).json({message:"Phone no Already Exist"});
// Create user with hashedpassword
        const salt = await bcrypt.genSalt(10);
const hashedpassword = await bcrypt.hash(Password, salt);
            const Students=await stave.create({Name,Email,PhoneNo,Password:hashedpassword,
        Country,Address})
        return res.status(201).json({message:"Registration Successful",Students})
    }catch (error){console.error(error)
        res.status(500).json({message:"Server Error",error})
    }
}

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
    const {Email, Password}=req.body
    try{
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