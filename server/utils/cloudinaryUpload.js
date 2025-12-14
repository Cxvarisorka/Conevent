const cloudinary = require('../config/cloudinary.config');
const { Readable } = require('stream');

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} - Cloudinary image URL
 */
const uploadToCloudinary = (fileBuffer, folder = 'conevent') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const readableStream = Readable.from(fileBuffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} imageUrl - Cloudinary image URL
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/conevent/logos/image.jpg
    const urlParts = imageUrl.split('/');

    // Find the 'upload' part index
    const uploadIndex = urlParts.findIndex(part => part === 'upload');

    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    // Get everything after 'upload/v123456/' (version can be skipped)
    let pathAfterUpload = urlParts.slice(uploadIndex + 1);

    // Remove version if present (starts with 'v' followed by numbers)
    if (pathAfterUpload[0] && pathAfterUpload[0].match(/^v\d+$/)) {
      pathAfterUpload = pathAfterUpload.slice(1);
    }

    // Join path and remove file extension
    const publicId = pathAfterUpload.join('/').replace(/\.[^/.]+$/, '');

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};