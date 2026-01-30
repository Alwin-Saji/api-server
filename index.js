import 'dotenv/config';
import express from 'express';
import connectDB from './lib/connectDB.js';
import userrouter from './routes/user.route.js';
import postrouter from './routes/post.route.js';
import commentrouter from './routes/comment.route.js';
import webhookrouter from './routes/webhook.route.js';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';

const app = express();

// 🔥 REQUIRED FOR RENDER + CLERK
app.set("trust proxy", 1);

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith("http://localhost")) return callback(null, true);
    if (origin.includes("vercel.app")) return callback(null, true);
    return callback(new Error("CORS blocked"));
  },
  credentials: true,
}));

app.use(express.json());

// Public routes
app.use('/webhooks', webhookrouter);
app.use('/users', userrouter);

// Clerk AFTER public routes
app.use(clerkMiddleware());

// Protected routes
app.use('/posts', postrouter);
app.use('/comments', commentrouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
