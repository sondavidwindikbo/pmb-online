// src/middleware/upload.js
// Middleware untuk upload file menggunakan multer

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadDir = './uploads';
const subDirs = ['ktp', 'ijazah', 'foto', 'rapor', 'bukti-bayar'];

// Buat folder jika belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

subDirs.forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tentukan folder berdasarkan jenis berkas
    const jenisBerkas = req.body.jenis_berkas || 'ktp';
    const folder = path.join(uploadDir, jenisBerkas);
    
    // Pastikan folder ada
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Format: pendaftar_id-jenis_berkas-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const jenisBerkas = req.body.jenis_berkas || 'doc';
    const pendaftarId = req.user.id || 'temp';
    
    const filename = `${pendaftarId}-${jenisBerkas}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filter file type
const fileFilter = (req, file, cb) => {
  // Allow images dan PDF
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('File harus berformat JPG, PNG, atau PDF'));
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024 // Default 2MB
  },
  fileFilter: fileFilter
});

// Middleware untuk single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Ukuran file terlalu besar. Maksimal 2MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        // Error lainnya
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // File berhasil diupload
      next();
    });
  };
};

// Middleware untuk multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Ukuran file terlalu besar. Maksimal 2MB per file'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Maksimal ${maxCount} file`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Helper function untuk delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile
};