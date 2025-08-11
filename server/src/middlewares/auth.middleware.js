import { asyncHandler } from "../utils/asyncHandler.js";
// import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req,res,next)=>{
    
    // get stored token from cookies
    // Verify the access token with jwt.verify
    // Add .user to req by using _id in decoded Token
    // update the user by deleting refresh token

try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")
    
        if(!token)
        {
            throw new ApiError(401,"Unauthorized Request")
        }
    
        const decodedToken =await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user =await User.findById(decodedToken._id)
    
        if(!user)
        {
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user
        next()
} catch (error) {
    throw new ApiError(401,"Invalid Access Token")
}
})