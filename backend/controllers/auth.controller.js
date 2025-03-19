import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs';

export const signup = async (req, res) => {
    // get the user information from request body
    const { email, username, password } = req.body;

    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        // check whether any user with same email 
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const user = new User({
            email, 
            password: hashedPassword,
            name,
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