
import { v2 as cloudinary } from 'cloudinary';
import { log } from "./vite";

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    log("Cloudinary service initialized", "cloudinary");
  }

  async uploadVideo(videoFile: Buffer, fileName: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload_stream({
        resource_type: 'video',
        folder: 'rfq-videos',
        public_id: `rfq-${Date.now()}-${fileName}`
      });
      return result.secure_url;
    } catch (error) {
      log(`Error uploading video: ${error}`, "cloudinary");
      throw error;
    }
  }

  async getVideoUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      secure: true
    });
  }
}

export const cloudinaryService = new CloudinaryService();
