import mongoose from "mongoose";

const connectDB = async () => {
    try{
       await mongoose.connect(process.env.MONGO);
       console.log("Database connected successfully");
    }catch(err){

        console.error(err.message);
    }

}
export default connectDB;