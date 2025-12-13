const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * Configure Cloudinary with credentials from environment variables
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Create Cloudinary storage for multer
 * Stores images in 'events' folder in Cloudinary
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'events', // Upload to 'events' folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
        }
      ],
    };
  },
});

/**
 * Create Cloudinary storage for profile images
 * Stores images in 'profiles' folder in Cloudinary
 */
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'profiles', // Upload to 'profiles' folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
        }
      ],
    };
  },
});

module.exports = {
  cloudinary,
  storage,
  profileStorage
};

