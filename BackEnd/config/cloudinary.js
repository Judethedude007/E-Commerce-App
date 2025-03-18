import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


(async function() {
  try {
    
    const result = await cloudinary.api.ping();
    console.log("✅ Connected to Cloudinary successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to Cloudinary:", error.message);
  }
})();

export default cloudinary;