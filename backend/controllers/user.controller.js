import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { File } from "../models/file.model.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Input sanitization
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim().toLowerCase();

  if (!trimmedEmail || !trimmedUsername || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Password validation
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({
    $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
  });

  if (existingUser) {
    if (existingUser.email === trimmedEmail) {
      throw new ApiError(400, "Email is already registered");
    } else {
      throw new ApiError(400, "Username is already taken");
    }
  }

  const newUser = await User.create({
    username: trimmedUsername,
    email: trimmedEmail,
    password,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(newUser._id);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        accessToken,
        refreshToken,
      },
      "User created successfully"
    )
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email: trimmedEmail }).select("+password");
  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new ApiError(400, "Invalid refresh token");
  }

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new ApiError(400, "Invalid refresh token");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  if (user._id.toString() !== decoded.id) {
    throw new ApiError(400, "Invalid refresh token");
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken, refreshToken: newRefreshToken },
      "Access token refreshed successfully"
    )
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user._id;

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim().toLowerCase();

  if (!trimmedUsername || !trimmedEmail) {
    throw new ApiError(400, "All fields are required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      username: trimmedUsername,
      email: trimmedEmail,
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      "User profile updated successfully"
    )
  );
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    throw new ApiError(400, "Invalid credentials");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, "Password updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      "User profile fetched successfully"
    )
  );
});

const uploadFile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { file } = req;

  if (!file) {
    throw new ApiError(400, "File is required");
  }

  try {
    const newFile = await File.create({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      userId: userId,
    });

    return res.status(201).json(new ApiResponse(201, newFile, "File uploaded successfully"));
  } catch (error) {
    // Clean up the uploaded file if DB operation fails
    fs.unlinkSync(file.path);
    throw error;
  }
});

const getFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  return res.status(200).json(new ApiResponse(200, file, "File fetched successfully"));
});

const downloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user._id;

  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  // Check if user owns the file
  if (file.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }

  const filePath = path.join(process.cwd(), "uploads", file.filename);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "File not found on server");
  }

  res.download(filePath, file.originalname, (err) => {
    if (err) {
      console.error("Download error:", err);
      throw new ApiError(500, "Error downloading file");
    }
  });
});

const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user._id;

  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  // Check if user owns the file
  if (file.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }

  const filePath = path.join(process.cwd(), "uploads", file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await File.findByIdAndDelete(fileId);

  return res.status(200).json(new ApiResponse(200, null, "File deleted successfully"));
});

const getAllFiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const files = await File.find({ userId })
    .skip((page - 1) * limit)
    .limit(limit);

  if (!files || files.length === 0) {
    throw new ApiError(404, "No files found");
  }

  return res.status(200).json(new ApiResponse(200, files, "Files fetched successfully"));
});

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
  getAllFiles,
};