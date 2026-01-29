import express from "express";
import { getUserSavedPosts, savePost } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/saved",getUserSavedPosts);
router.patch("/saved",savePost);

export default router;
