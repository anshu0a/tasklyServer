const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a single image buffer
function uploadSingleImage(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: `taskly/${Date.now()}-${filename}`,
        folder: "taskly",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Upload multiple images
async function uploadMultipleImages(files) {
  const results = [];
  for (const file of files) {
    const result = await uploadSingleImage(file.buffer, file.originalname);
    results.push({ 
      filename: file.originalname,
      path: result.secure_url,
      public_id: result.public_id
    });
  }
  return results;
}

// Delete a single image by public_id
async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return result;
  } catch (err) {
    console.error(`Error deleting image ${publicId}:`, err);
    throw err;
  }
}

module.exports = {
  cloudinary,
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
};
