import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Set storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter (optional: allow only certain file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// Set limits (e.g., 5MB max file size)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5 MB
};

export const upload = multer({ storage, fileFilter, limits });
