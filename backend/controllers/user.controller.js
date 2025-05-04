import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { File } from "../models/file.model.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        console.log("Finding user...");
        const user = await User.findById(userId);
        console.log("User found:", user);

        console.log("Generating access token...");
        const accessToken = user.generateAccessToken();
        console.log("Access token:", accessToken);

        console.log("Generating refresh token...");
        const refreshToken = user.generateRefreshToken();
        console.log("Refresh token:", refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("🔥 Token generation error:", error);
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};


const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if ([email,username,password].some((field)=>field.trim()==="")) {
        throw new ApiError(400,"All fields are required")
       }//validation

    const userExists = await User.findOne({ email })
    if (userExists) {
        throw new ApiError(400, "User already exists")
    }

    const newUser = await User.create({
        username:username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password
    })
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(newUser._id)

    const ApiResponseData = new ApiResponse(201, {
        user: {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        },
        accessToken,
        refreshToken
    },"User created successfully")
    return res.status(201).json(ApiResponseData)
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if ([email,password].some((field)=>field.trim()==="")) {
        throw new ApiError(400,"All fields are required")
       }//validation

    const user = await User.findOne({ email:email.trim().toLowerCase() }).select("+password")
    if (!user) {
        throw new ApiError(400, "Invalid credentials")
    }

    const isPasswordMatched = await user.comparePassword(password)
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const ApiResponseData = new ApiResponse(200, {
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
        },
        accessToken,
        refreshToken
    },"User logged in successfully")
    return res.status(200).json(ApiResponseData)
})

const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required")
    }

    const user = await User.findOne({ refreshToken })
    if (!user) {
        throw new ApiError(400, "Invalid refresh token")
    }
    user.refreshToken = null
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required")
    }

    const user = await User.findOne({ refreshToken })
    if (!user) {
        throw new ApiError(400, "Invalid refresh token")
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    if (user._id.toString() !== decoded.id) {
        throw new ApiError(400, "Invalid refresh token")
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"))
})

const updateProfile = asyncHandler(async (req, res) => {
    const { username, email } = req.body
    const userId = req.user._id

    if ([username,email].some((field)=>field.trim()==="")) {
        throw new ApiError(400,"All fields are required")
       }//validation

    const user = await User.findByIdAndUpdate(userId, {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase()
    }, { new: true, runValidators: true })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(new ApiResponse(200, {
        _id: user._id,
        username: user.username,
        email: user.email,
    },"User profile updated successfully"))
})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const userId = req.user._id

    if ([oldPassword,newPassword].some((field)=>field.trim()==="")) {
        throw new ApiError(400,"All fields are required")
       }//validation

    const user = await User.findById(userId).select("+password")
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordMatched = await user.comparePassword(oldPassword)
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid credentials")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, null, "User password updated successfully"))
})
const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const user = await User.findById(userId).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res.status(200).json(new ApiResponse(200, {
        _id: user._id,
        username: user.username,
        email: user.email,
    },"User profile fetched successfully"))
})

const uploadFile = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { file } = req

    if (!file) {
        throw new ApiError(400, "File is required")
    }

    const newFile = await File.create({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        userId: userId
    })

    return res.status(201).json(new ApiResponse(201, newFile, "File uploaded successfully"))
})
const getFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params

    const file = await File.findById(fileId)
    if (!file) {
        throw new ApiError(404, "File not found")
    }
    return res.status(200).json(new ApiResponse(200, file, "File fetched successfully"))
})

const downloadFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params

    const file = await File.findById(fileId)
    if (!file) {
        throw new ApiError(404, "File not found")
    }
    const filePath = path.join(process.cwd(), "uploads", file.filename)
    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, "File not found on server")
    }
    res.download(filePath, file.originalname, (err) => {
        if (err) {
            console.error("Error downloading file:", err)
            throw new ApiError(500, "Error downloading file")
        }
    })
})

const deleteFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params

    const file = await File.findById(fileId)
    if (!file) {
        throw new ApiError(404, "File not found")
    }
    const filePath = path.join(process.cwd(), "uploads", file.filename)
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }
    await File.findByIdAndDelete(fileId)

    return res.status(200).json(new ApiResponse(200, null, "File deleted successfully"))
})

const getAllFiles = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const files = await File.find({ userId })
    if (!files) {
        throw new ApiError(404, "No files found")
    }

    return res.status(200).json(new ApiResponse(200, files, "Files fetched successfully"))
})


export {
    register,
    login,
    logout,
    refreshAccessToken,
    updateProfile,
    updatePassword,
    getUserProfile,
    uploadFile,
    getFile,
    downloadFile,
    deleteFile,
    getAllFiles
}