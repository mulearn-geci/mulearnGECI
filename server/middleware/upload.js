const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let baseDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : 'uploads';
    let subFolder = '';

    if (req.baseUrl.includes('/posts')) {
      subFolder = 'posts';
    } else if (req.baseUrl.includes('/events')) {
      subFolder = 'events';
    } else if (req.baseUrl.includes('/users')) {
      subFolder = 'users';
    } else if (req.baseUrl.includes('/execom')) {
      subFolder = 'execom';
    } else if (req.baseUrl.includes('/alumni')) {
      subFolder = 'alumni';
    }

    const targetDir = subFolder ? path.join(baseDir, subFolder) : baseDir;

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (err) {
      console.error('Directory creation warning:', err.message);
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname) || '.jpg';
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 25);

    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Configure multer (50MB limit)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  },
  fileFilter: fileFilter
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  } else if (error && error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Helper function to safely delete file
const deleteFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string' || filePath.startsWith('data:') || filePath.startsWith('http')) {
    return;
  }
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(__dirname, '..', cleanPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    // Ignore deletion errors on serverless environments
  }
};

// Helper to convert uploaded file into Base64 Data URL or clean URL
const processUploadedFile = (file, defaultFolder = 'alumni') => {
  if (!file) return '';
  try {
    if (file.path && fs.existsSync(file.path)) {
      const buffer = fs.readFileSync(file.path);
      try { fs.unlinkSync(file.path); } catch (e) {}
      return `data:${file.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    }
  } catch (err) {
    console.error('Error converting file to Base64:', err.message);
  }
  if (file.filename) {
    return `/uploads/${defaultFolder}/${file.filename}`;
  }
  return '';
};

module.exports = {
  upload,
  handleUploadError,
  deleteFile,
  processUploadedFile
};