import { parse } from "dotenv";
import postModel from "../models/post.model.js";
import User from "../models/user.model.js";
import ImageKit from "imagekit";

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {};

    const cat = req.query.cat;
    const author = req.query.author;
    const searchQuery = req.query.searchQuery;
    const sortQuery = req.query.sortQuery;
    const featured = req.query.featured;

   if(cat){
      query.category = cat;
   };
   if(searchQuery){
      query.title = { $regex: searchQuery, $options: "i" };
   }
   if(author){
      const user=await User.findOne({username:author}).select("_id");
      if(!user){
        return res.status(404).json("Author not found");
    }
      query.user = user._id;
   }

   let sortObj={createdAt:-1};

   if(sortQuery){
      switch(sortQuery){
        case "newest":
          sortObj={createdAt:-1};
          break;
        case "oldest":
          sortObj={createdAt:1};
          break;
        case "popular":
          sortObj={visit:-1};
          break;
        case "trending":
          sortObj={visit:-1};
          query.createdAt={
            $gte: new Date(new Date().getTime() - 7*24*60*60*1000)
          };
          break;
        default:
          break;
      }
   } 

   if(featured){
      query.isFeatured=true;
   };
   
    
    // Validate inputs
    if (page < 1) return res.status(400).json("Page must be positive");
    if (limit < 1) return res.status(400).json("Limit must be positive");

    const posts = await postModel.find(query)
      .populate("user", "username")
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalPosts = await postModel.countDocuments();
    const hasmore = page * limit < totalPosts;

    res.status(200).json({ posts, hasmore });
  } catch (err) {
    console.error("Error in getPosts:", err);
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
};

export const getPost = async (req, res) => {
  const post = await postModel.findOne({slug:req.params.slug}).populate(
    "user",
    "username img clerkUserId");
  res.status(200).json(post);
};
export const createPost = async (req, res) => {
    const clerkUserId= req.auth.userId;
    
    if(!clerkUserId){
        return res.status(404).json("Not Authenticated");
    }

    const user= await User.findOne({clerkUserId});

    if(!user){
        return res.status(404).json("User not found(from create post)");
    }

    if (!req.body.title) {
        return res.status(400).json("Title is required");
    }

    let slug = req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    let existingPost = await postModel.findOne({ slug });
    
    let counter=2;

    while(existingPost){
        slug = `${slug}-${counter}`;
        existingPost = await postModel.findOne({ slug });
        counter++;
    }

    const newPost = new postModel({user:user._id,slug,...req.body});

    const post= await newPost.save();
    res.status(200).json(post);
};



  export const deletePost = async (req, res) => {
    
    const clerkUserId= req.auth.userId;
      
      if(!clerkUserId){
          return res.status(404).json("User not found(from delete post)");
      }

      const role = req.auth.sessionClaims?.metadata?.role || "user";

      if(role==="admin"){
        await postModel.findByIdAndDelete(req.params.id);
        return res.status(200).send("Post Deleted Successfully");
      }

      const user = await User.findOne({clerkUserId});

      if(!user){
        return res.status(404).json("User not found");
      }

      const deletedPost=await postModel.findOneAndDelete({
        _id: req.params.id,
          user: user._id });

    if(!deletedPost){
        return res.status(404).json("You are not authorized to delete this post");
    }

    res.status(200).send("Post Deleted Successfully");
  };


  export const featurePost = async (req, res) => {
    const clerkUserId = req.auth.userId;
    const postId = req.body.postId;

    if (!clerkUserId) {
      return res.status(401).json("Not authenticated");
    }

    const role = req.auth.sessionClaims?.metadata?.role || "user";

    if (role !== "admin") {
      return res.status(403).json("Only admins can feature posts");
    }

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json("Post not found");
    }
    const isFeatured = post.isFeatured;

    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { isFeatured: !isFeatured },
      { new: true }
    );

    res.status(200).json(updatedPost);
  };

  const imagekit=new ImageKit({
    urlEndpoint:process.env.IK_URL_ENDPOINT,
    publicKey:process.env.IK_PUBLIC_KEY,
    privateKey:process.env.IK_PRIVATE_KEY,
  });

  export const uploadAuth= async (req,res)=>{
    const result=imagekit.getAuthenticationParameters();
    res.send(result);
  }