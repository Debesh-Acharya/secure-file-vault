import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Helper function to verify the JWT token
export const verifyJwt = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return reject(new ApiError(401, "Invalid or expired token", err));  // More clear error message
      }
      resolve(decoded);
    });
  });
}

// Middleware to protect routes that require authentication
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];  // Extract token
  }
  // Check for token in cookies
  else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // If no token found, throw an error
  if (!token) {
    throw new ApiError(401, "Not authorized, no token");
  }

  try {
    // Verify the token
    const decoded = await verifyJwt(token);

    // Find the user by the decoded ID (excluding password and refreshToken)
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Attach the user data to the request object
    req.user = user;
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    // Catch any error during token verification or user fetching
    next(error);  // Forward the error to the global error handler
  }
});
