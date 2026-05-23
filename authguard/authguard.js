import jwt from "jsonwebtoken";
import cohortfour from "../model/user.js";

export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Decoded Token Payload:", decoded);

      // Attach user to request (hide password)
      req.user = await cohortfour.findById(decoded.id||decoded._id).select("-password").lean();
      

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      console.error("Authguard Error:", error);
      // Handle expired vs invalid tokens
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
    }
 return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};


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

