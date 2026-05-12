import mongoose from "mongoose";
import env from 'dotenv'
env.config();
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("MongoDB is connected");
    
}).catch(()=>{
    console.log("MongoDB is not connected");
    
})