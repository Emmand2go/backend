import mongoose from "mongoose";
const cohortfourschema= new mongoose.Schema(
    {Name:{type:String,required:true},
        Email:{type:String,required:true,unique:true},
        PhoneNo:{type:String, required:true, unique:true},
        Password:{type:String,required:true},
        Country:{type:String},
        Address:{type:String},
emailConfirmed: {
  type: Boolean,
  default: false,
},
    }, {timestamps:true},
{ bufferCommands: false })
const cohortfour=mongoose.model("cohortfours",cohortfourschema)
export default cohortfour