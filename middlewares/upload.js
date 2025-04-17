const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Create upload middleware dynamically
 * @param {string} folderPath - relative folder path (e.g., 'assets/images/users')
 * @param {function} getFilename - (req, file) => string (custom filename logic)
 */
function createUploadMiddleware(folderPath, getFilename) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "..", folderPath);
      if (!fs.existsSync(uploadPath))
        fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = getFilename(req, file) + ext;
      cb(null, filename);
    },
  });

  return multer({ storage });
}

module.exports = createUploadMiddleware;
