const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000 // 120 seconds timeout (default is 60 seconds) [citation:2]
});

// Use memory storage
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Upload to Cloudinary with retry logic
const uploadToCloudinary = async (buffer, options = {}, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Upload attempt ${attempt}/${retries}...`);
      
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'job-portal/resumes',
            resource_type: 'auto',
            public_id: `resume-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            timeout: 120000, // 2 minute timeout per attempt [citation:2]
            ...options
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Send buffer to upload stream
        uploadStream.end(buffer);
        
        // Set a timeout for the entire operation
        setTimeout(() => {
          reject(new Error('Upload operation timed out'));
        }, 130000); // 130 seconds total
      });
      
      console.log(`✅ Upload successful on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        // Last attempt failed
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = { upload, uploadToCloudinary };