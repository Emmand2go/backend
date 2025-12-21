import { products } from "../model/products.js";

export const createProduct=async(req, res)=>{
    try{const {name,price,description,image,category}= req.body;
const newProduct=await products.create({name,price,description,image,category})
res.status(201).json({success:true,message:"Product Created Successfully",product:newProduct})
}catch(error){console.error(error)
res.status(500).json({success:false,message:"Server Error"});
}
}
export const getProductById=async(req, res) =>{
    const productId=req.params.id;
    try{const find=await products.findById(productId);
    if(!find) return res.staus(403).json({message:"Product Not Found"});
        res.status(201).json(find);
}catch(error){res.status(500).json}({message:error.message})}

export const getAllProducts = async(req,res)=>{
    try{let goods=await products.find() //.select('-price')
        res.status(200).json(goods)
    }catch(error){res.status(500).json({message:'Server Error',error})}
}

//Update Products
export const updateProducts=async(req,res)=>{let userId=req.params.id
    const {name, price,description}=req.body
    try{let goods=await products.findByIdAndUpdate(userId)
        if(!goods) return res.status(404).json({message:"User Not Found"})
            // Update only if provided
         user.name = name || user.name;
        user.price = price || user.price;
        user.description = description || user.description;
        await user.save()
        return res.status(200).json({
            message: "User successfully updated",
           updatedUser: {
                id: user._id,
                name: user.name,
                price: user.price,
                description: user.description,
            }
        });
    }catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }}

