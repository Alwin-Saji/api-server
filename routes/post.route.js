import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  uploadAuth,
  featurePost
} from "../controllers/post.controller.js";
import increaseVisit from "../middleware/increasevisit.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// 🔐 Protected (specific first)
router.get("/upload-auth", uploadAuth);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.patch("/feature", featurePost);

// 🌍 Public
router.get("/", getPosts);
router.get("/:slug", increaseVisit, getPost);

export default router;
