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

// CORS (single source of truth)
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Core middleware
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use('/webhooks', webhookrouter);
app.use('/users', userrouter);
app.use('/posts', postrouter);
app.use('/comments', commentrouter);

// Error handler (last)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
    status: err.status,
    stack: err.stack
  });
});

// Start server (only once)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
