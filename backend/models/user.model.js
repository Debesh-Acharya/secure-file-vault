import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: 3,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false, // don't return by default
      },
      refreshToken: {
        type: String,
        select: false,
      },
},{timestamps: true});


// hash password before saving to database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

// compare password with hashed password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

// generate JWT token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email,
    }, 
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
 );
}

// generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id,
    }, 
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
 );
}

export const User = mongoose.model('User', userSchema);