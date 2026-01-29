import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from 'node:path';
import { sendFailure, sendSuccess, asyncWrap } from "../../utils/commonUtils.js";
import config from "../../../../config/index.js";
import { appString } from "../../utils/appString.js";

const { userAlreadyExists, registeredSuccesfully, emailNotFound, invalidPassword, loginSuccesfully, refreshTokenRequired, newAccessTokenGenerated, userLoggedOut, noFileUploaded, fileUploadedSuccessfully, userNotFound, profileFetchedSuccessfully, allFieldsRequired, profileUpdatedSuccessfully } = appString;

// function to generate tokens
        const generateToken = (userId) => {
            const accessToken = jwt.sign({ id: userId }, config.JWT_ACCESS_SECRET, {expiresIn: '30m'});
            const refreshToken = jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {expiresIn: '7d'});
            return {accessToken, refreshToken};
        };

// register controller
export const registerController = asyncWrap(async (req, res) => {
    const { userName, email, password, filename } = req.body;

    // Normalize email for consistent storage
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return sendFailure(res, userAlreadyExists, 400);

    // hashing the password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ userName, email: normalizedEmail, password: hashedPassword , filename});
    await newUser.save();

    const { accessToken, refreshToken } = generateToken(newUser._id);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000 // 30 minutes
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    sendSuccess(res, registeredSuccesfully);
});

// login controller
export const loginController = asyncWrap(async (req, res) => {
    const { email, password } = req.body;

    // Check if password exists
    if (!password) {
        return sendFailure(res, 'Password is required', 400);
    }

    // Normalize email for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();

    // Use +password to select the password field (it's excluded by default due to select: false)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) return sendFailure(res, emailNotFound, 400);

    // Check if user has password
    if (!user.password) {
        console.log('User found but no password stored:', user.email);
        return sendFailure(res, invalidPassword, 401);
    }

    console.log('Login attempt:', { email: normalizedEmail, passwordProvided: !!password, userHasPassword: !!user.password });
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt compare result:', isMatch);
    if (!isMatch) return sendFailure(res, invalidPassword, 401);

    const { accessToken, refreshToken } = generateToken(user._id);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000 // 30 minutes
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    sendSuccess(res, loginSuccesfully);
});

// to generate accestoken.
export const handleTokenRefresh = asyncWrap((req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        // Use sendFailure for authentication issues
        return sendFailure(res, refreshTokenRequired, 401); 
    }

    const decoded = jwt.verify(incomingRefreshToken, config.JWT_REFRESH_SECRET);
    const newAccessToken = generateToken(decoded.id).accessToken;

    res.cookie('accessToken', newAccessToken, { 
        httpOnly: true, 
        secure: config.NODE_ENV === 'production', 
        maxAge: 1800000 // 30 minutes in milliseconds
    }); 

    sendSuccess(res, newAccessTokenGenerated);
});

//logout controller
const logoutUser = asyncWrap((req, res) => {
    res.cookie ('accessToken', '' ,{
        maxAge: 0,
        httpOnly: true,
        secure : config.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.cookie ('refreshToken', '' ,{
        maxAge: 0,
        httpOnly: true,
        secure : config.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    sendSuccess(res, userLoggedOut);
});

export {logoutUser};

// upload controller
export const uploadFile = asyncWrap(async (req, res) => {
    if (!req.file) {
        return sendFailure(res, noFileUploaded, 400);
    }

    console.log(`Filename: ${req.file.filename},  Mimetype: ${req.file.mimetype}`);

    // Get user ID from header
    const userId = req.headers['userid'];
    
    // Save filename to user document in database
    await User.findByIdAndUpdate(userId, { filename: req.file.filename });
    
    const fileData = {
        filename: req.file.filename,
        mimetype: req.file.mimetype
    };

    sendSuccess(res, fileUploadedSuccessfully, { file: fileData });
});

// get profile controller.
export const getProfileController = asyncWrap(async (req, res) => {
    const userId = req.headers['userid'];
    const user = await User.findById(userId).select('-password');

    if (!user) {
        return sendFailure(res, userNotFound, 404);
    }

    sendSuccess(res, profileFetchedSuccessfully, { user });
});

// update profile controller
export const updateProfileController = asyncWrap(async (req, res) => {
    const userId = req.headers['userid']; 
    const { userName, email } = req.body; 

    // Allow updating either or both fields
    if (!userName && !email) {
        return sendFailure(res, allFieldsRequired, 400);
    }

    // Build update object with only provided fields
    const updateData = {};
    if (userName) updateData.userName = userName;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true } 
    ).select('-password'); 

    if (!updatedUser) {
        return sendFailure(res, userNotFound, 404);
    }

    sendSuccess(res, profileUpdatedSuccessfully, { updatedUser });
});
