const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/reports/';

// Ensure specific subdirectories exist
const ensureDirs = () => {
    ['uploads/reports', 'uploads/audio'].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
ensureDirs();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Match the expected pathology report prefix
        cb(null, `report-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|pdf/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images and PDFs only!'));
        }
    }
});

module.exports = upload;
