import mongoose from 'mongoose'

export const connectToDB = async () =>{
    mongoose.set('strictQuery', true)
    if(!process.env.MONGODB_URI) return console.log("Connection failed");
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connected");
        
    } catch (error) {
        console.log("connection failed",error);
        
    }
    
}
