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

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Render health checks, Clerk webhooks)
    if (!origin) {
      return callback(null, false); // ⬅️ IMPORTANT
    }

    if (origin.endsWith('.vercel.app')) {
      return callback(null, origin); // ⬅️ return ORIGIN, not true
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
