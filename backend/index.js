import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './db/connectDB.db.js'
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello Shivangi");
})

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on PORT: ${PORT}`);
})