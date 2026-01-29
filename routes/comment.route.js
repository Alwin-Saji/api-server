import express from "express";
import { getPostcomments, addcomments, deletecomments } from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:postId",getPostcomments)
router.post("/:postId",addcomments)
router.delete("/:id",deletecomments)

export default router;
