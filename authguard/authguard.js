import jwt from "jsonwebtoken";
import User from "../model/user.js";

export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      // req.user.id = decoded.id; // this is the permanent _id
      //   // ✅ Set only user ID from token
      // req.user = { _id: decoded.id };

      // Attach user to request (hide password)
      req.user = await User.findById(decoded.id).select("-password").lean();
      

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
}


// import jwt from "jsonwebtoken";

// export const protect = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Access Denied, No Token Provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Ensure JWT_SECRET is in your environment variables
//     req.user = decoded;  // Add user info to request (from token)
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid Token" });
//   }
// };

