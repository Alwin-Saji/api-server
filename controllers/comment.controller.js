import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const getPostcomments = async (req,res)=>{
    const comments = await Comment.find({post:req.params.postId})
    .populate("user","username img")
    .sort({createdAt:-1});

    res.json(comments);
}


export const addcomments = async (req,res, next)=>{
    try {
        const clerkUserId= req.auth.userId;
        const postId = req.params.postId;

        if(!clerkUserId){
            return res.status(401).json("Not Authenticated");
        }


        const user = await User.findOne({clerkUserId});

        if (!user) {
            return res.status(404).json("User not found"); 
        }

        const newComment = new Comment({ 
            ...req.body,
            user: user._id,
            post: postId
        })

        const savedComment = await newComment.save();
        setTimeout(() => {
        res.status(201).json(savedComment);
        }
        ,3000)
    } catch (err) {
        next(err);
    }
}

export const deletecomments = async (req, res) => {
    const clerkUserId = req.auth.userId;
    const id = req.params.id;

    if (!clerkUserId) {
        return res.status(401).json("Not Authenticated");
    }

    const role = req.auth.sessionClaims?.metadata?.role || "user";

    if (role === "admin") {
        await Comment.findByIdAndDelete(id);
        return res.status(200).json("Comment deleted");
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
        return res.status(404).json("User not found");
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: id,
        user: user._id
    });

    if (!deletedComment) {
        return res.status(403).json("You can delete only your comment");
    }

    res.status(200).json("Comment deleted");
}

