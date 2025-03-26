import { User } from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import crypto from "crypto";
import jwt from 'jsonwebtoken';

import { generateVerificationCode } from '../utils/generateVerificationCode.utils.js';
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.utils.js";
import {
	sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail
} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    // get the user information from request body
    const { email, username, password } = req.body;

    console.log(req.body);

    try {
        if (!email || !username || !password) {
            throw new Error("All fields are required");
        }

        // check whether any user with same email 
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = generateVerificationCode();


        const user = new User({
            email, 
            password: hashedPassword,
            username,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        })

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
    
    
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if(!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("Error in verifying email: ", error);
        res.status(500).json({success: false, message: "Server error"});
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User not found" });

        // Check password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const logout = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({success: true, message: "User logged out sucessfully"});
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
    
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
    
        await user.save();
    
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgot password: ", error);
        res.status(400).json({ success: false, message: error.message });
    }

}

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${token}`);



		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = (req, res) => {
    try {
        console.log("User in checkAuth:", req.user); // Debugging

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized - No user data found" });
        }

        res.status(200).json({ success: true, userId: req.user.userId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
