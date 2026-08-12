const multer = require("multer");
const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary = require("../config/Cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "LMS",
    resource_type: "auto",
  }),
});

const upload = multer({
  storage,
});

module.exports = upload;