import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const fixedPath = localFilePath.replace(/\\/g, "/");

    const result = await cloudinary.uploader.upload(fixedPath, {
      folder: "uploads",
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};
