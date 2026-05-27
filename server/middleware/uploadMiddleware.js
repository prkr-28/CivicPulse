const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'civicpulse/issues',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    console.log('Upload middleware - File received:', file.originalname, 'MIME:', file.mimetype);
    if (!file.mimetype.startsWith('image/')) {
      console.log('Upload middleware - File rejected: not an image');
      return cb(new Error('Only image files are allowed'));
    }
    console.log('Upload middleware - File accepted');
    cb(null, true);
  }
});

module.exports = upload;
