import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import userRoute from "./route/user.js"

const app= express();
app.use (express.json());
dotenv.config();
app.listen(4000,()=>{
    console.log(`backend is running in port ${process.env.PORT}`)
})
app.use('/api/users',userRoute)
app.get('/',(req,res)=>{res.send('Hello queen HOW ARE YOU')})
mongoose.connect(process.env.MONGODB_URL)
.then(()=>{console.log("connected to my database")})
.catch(()=>{console.log("E no connect oh");
})