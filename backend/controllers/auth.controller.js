import { User } from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import { generateVerificationCode } from '../utils/generateVerificationCode.utils.js';

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

export const login = async (req, res) => {
    res.send("signup route")
}

export const logout = async (req, res) => {
    res.send("signup route")
}