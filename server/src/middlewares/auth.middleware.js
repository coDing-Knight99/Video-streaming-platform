import { asyncHandler } from "../utils/asyncHandler.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req,res,next)=>{
    
    // get stored token from cookies
    // Verify the access token with jwt.verify
    // Add .user to req by using _id in decoded Token
    // update the user by deleting refresh token

try {
    const token = req.cookies?.accessToken || req.cookies?.AccessToken;
    console.log("Token from cookie:", token);

    if (!token) {
        console.log(1);
        throw new ApiError(401, "Unauthorized Request");
    }

    console.log("Verifying token...");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // no await needed here
    console.log("Decoded token:", decodedToken);

    console.log("Fetching user...");
    const user = await User.findById(decodedToken._id);
    console.log("User found:", user);

    if (!user) {
        console.log(2);
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
} catch (error) {
    console.log("JWT verification error:", error.name, error.message);
    console.log(req.cookies);
    console.log(0);
    throw new ApiError(401, "Invalid Access Token");
}

})