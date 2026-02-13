import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import userRoute from "./route/user.js"
import product from './route/products.js'
import cors from 'cors'

const app= express();

const allowedOrigins=["http://localhost:5173","https://localhost:5173","https://backend-dmwx.onrender.com","http://backend-dmwx.onrender.com","https://localhost:5174","http://localhost:5174"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use (express.json());
dotenv.config();
app.listen(4000,()=>{
    console.log(`backend is running in port ${process.env.PORT}`)
})
app.use('/api/users',userRoute)
app.use('/api/product',product)
app.get('/',(req,res)=>{res.send('Hello queen HOW ARE YOU')})
mongoose.connect(process.env.MONGODB_URL)
.then(()=>{console.log("connected to my database")})
.catch(()=>{console.log("E no connect oh");
})

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB Connected...");
    
//     // Start your server ONLY after connection is successful
//     app.listen(5000, () => console.log("Server running on port 5000"));
//   } catch (err) {
//     console.error("Connection failed:", err.message);
//     process.exit(1);
//   }
// };

// connectDB();