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
const allowedOrigins = [
  "http://localhost:5173",
  "https://blog-pi-seven-82.vercel.app", // Replace with your actual production frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Clerk-Handshake"]
}));

// Webhook route MUST be before express.json() to preserve raw body for signature verification
app.use('/webhooks', webhookrouter);

app.use(express.json());

// Clerk middleware (MUST be before routes that use req.auth)
app.use(clerkMiddleware());

// Public routes
app.use('/users', userrouter);

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
