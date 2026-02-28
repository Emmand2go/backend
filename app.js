import dotenv from "dotenv"
dotenv.config();
import express from "express"
import mongoose from "mongoose"
import userRoute from "./route/user.js"
import product from './route/products.js'
import orderRoute from './route/orders.js'
import cors from 'cors'
import { errorHandler } from "./authguard/errorhandler.js";
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

// B1..app.listen(4000,()=>{
//     console.log(`backend is running in port ${process.env.PORT}`)
// })
app.use('/api/users',userRoute);
app.use('/api/product',product);
app.use('/api/order',orderRoute);
app.get('/',(req,res)=>{res.send('Hello queen HOW ARE YOU')});

app.use((err, req, res, next) => {
  console.error("Global Error Log:", err.stack); // Still log to terminal for you
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // Only show stack trace if you're not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to database");

    app.listen(4000, () => {
      console.log("Backend running on port 4000");
    });

  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
// B2..mongoose.connect(process.env.MONGODB_URL)
// .then(()=>{console.log("connected to my database")})
// .catch(()=>{console.log("E no connect oh");
// })

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