import mongoose from "mongoose";
import { USER_STATUS } from "../../utils/enum.js";

const userSchema = new mongoose.Schema ( 
    {
        userName : {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [2, "Username must be at least 2+ characters long"]
        },
        
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please enter a valid email address'
            ],
        },

        password: {
            type: String,
            required: [true, 'password is required'],
            minlength: [6, 'password must be at least 6 characters long'],
            select: false,
        },

        filename : {
            type: String,
            default: 'default/avatar.jpg'
        },

        status: {
            type: Number,
            enum: Object.values(USER_STATUS),
            default: USER_STATUS.ACTIVE,
          },
    }, 
    {timestamps: true}
);


const User = mongoose.model('User', userSchema);

export default User; 