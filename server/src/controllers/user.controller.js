import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../utils/cloudinary.js";
import {User} from "../models/user.model.js"
import cookieParser from "cookie-parser";
const generateAccessAndRefreshTokens = async (user_id)=>{   
    try{
        const user = await User.findById(user_id);

    const accessToken = user.generateRefreshToken();
    const refreshToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken,refreshToken};}
    catch(error){
        throw new ApiError(500, "Error generating tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    const {username,email,fullName,password} = req.body;

    if([username,email,fullName,password].some(field=> field?.trim()==='')){
        throw new ApiError(401, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(401, "Username or Email already exists");
    }

    const avatarlocalPath=req.files?.avatar[0]?.path;
    if(!avatarlocalPath){
        throw new ApiError(401, "Avatar is required");
    }

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }

    const avatar = await upload(avatarlocalPath);
    if(!avatar){
        throw new ApiError(500, "Avatar upload failed");
    }   
    const coverImage = upload(coverImageLocalPath); 

    const user=await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : "",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(! createdUser){
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered successfully")
    );
})

const loginUser = asyncHandler(async(req,res) => {

    //req.body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookies

    const {email,username,password} = req.body;
    if(!username && !email)
    {
        throw new ApiError(400, "Either Username or Email should be provided")
    }
    const user =await User.findOne({
        $or:[{username},{email}]
    })

    if(!user)
    {
        throw new ApiError("User Does Not Exists")
    }
    
    const isPasswordCorrect = await user.isPasswordCorrect(password);      // small u in user to provide context to current object through this keyword
    if(!isPasswordCorrect){ 
        throw new ApiError(401, "Incorrect Password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if(!loggedInUser){
        throw new ApiError(500, "User login failed");
    }

    const options={
        httpOnly:true,
        secure:true,
    }

    return res.status(200).cookie("RefreshToken",refreshToken,options).cookie("AccessToken",accessToken,options).json(
        new ApiResponse(200,{user:loggedInUser,refreshToken,accessToken},"User Logged In Successfully"))

})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user._id, {$unset:{refreshToken:1}}, {new: true});
    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200).clearCookie("RefreshToken",options).clearCookie("AccessToken",options).json(
        new ApiResponse(200,{},"User Logged Out Successfully")
    )
})


export { registerUser , loginUser, logoutUser};