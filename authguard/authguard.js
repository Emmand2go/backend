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

      // Attach user to request (hide password)
      req.user = await User.findById(decoded.id).select("-password");
      

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