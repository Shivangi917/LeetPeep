import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach userId to request object

        console.log("Decoded user:", req.user); // Debugging

        next(); // Move to next middleware
    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};
