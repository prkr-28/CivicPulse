const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✓ Image deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('✗ Failed to delete image from Cloudinary:', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  deleteImageFromCloudinary
};
