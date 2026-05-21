const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure specific subdirectories exist
const ensureDirs = () => {
    ['uploads/reports', 'uploads/audio', 'uploads/certificates'].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
ensureDirs();

const reportStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/reports/');
    },
    filename: (req, file, cb) => {
        // Match the expected pathology report prefix
        cb(null, `report-${Date.now()}-${file.originalname}`);
    }
});

const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificates/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
};

const upload = multer({ 
    storage: reportStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter
});

const uploadCertificate = multer({
    storage: certificateStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});

module.exports = { upload, uploadCertificate };
