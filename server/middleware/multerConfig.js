import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('=== MULTER DESTINATION DEBUG ===');
    console.log('Destination function called');
    console.log('Uploads directory:', uploadsDir);
    console.log('Directory exists:', fs.existsSync(uploadsDir));
    
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Directory created successfully');
    }
    
    console.log('Setting destination to:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('=== MULTER FILENAME DEBUG ===');
    console.log('Filename function called');
    console.log('Original filename:', file.originalname);
    console.log('Fieldname:', file.fieldname);
    console.log('Mimetype:', file.mimetype);
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    
    cb(null, filename);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  console.log('=== MULTER FILE FILTER DEBUG ===');
  console.log('File filter called');
  console.log('File details:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
    encoding: file.encoding
  });
  
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  console.log('Extension check:', extname);
  console.log('Mimetype check:', mimetype);

  if (extname && mimetype) {
    console.log('✓ File accepted');
    cb(null, true);
  } else {
    console.log('❌ File rejected');
    cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Limit file size to 2MB
});

export default upload;
