import mongoose from "mongoose";
const productschema=new mongoose.Schema(
    {name:{type:String,required:true},
    price:{type:Number,required:true},
    description:{type:String,required:true},
    image:{type:String},
    stock:{type:String},
    category:{type:String},
    },
     {timestamps:true},
)
export const products=mongoose.model("products",productschema)