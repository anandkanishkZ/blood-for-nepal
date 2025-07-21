import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Helper function to get all files from directory (recursively)
const getFilesRecursively = async (directory) => {
  const files = [];
  
  // Read directory contents
  const dirEntries = await readdir(directory, { withFileTypes: true });
  
  // Process each entry
  for (const entry of dirEntries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively get files from subdirectory
      const subDirFiles = await getFilesRecursively(fullPath);
      files.push(...subDirFiles);
    } else {
      // Get file stats
      const fileStats = await stat(fullPath);
      const relativePath = fullPath.replace(process.cwd(), '').replace(/\\/g, '/');
      
      // Add file info to array
      files.push({
        name: entry.name,
        path: relativePath,
        fullPath: fullPath,
        size: fileStats.size,
        created: fileStats.birthtime,
        modified: fileStats.mtime,
        type: path.extname(entry.name).toLowerCase().substring(1) || 'unknown'
      });
    }
  }
  
  return files;
};

// Get all media files
export const getAllMedia = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Check if directory exists
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Uploads directory not found'
      });
    }
    
    // Get all files recursively
    const files = await getFilesRecursively(uploadsDir);
    
    // Format file sizes for display
    const formattedFiles = files.map(file => ({
      ...file,
      sizeFormatted: formatFileSize(file.size),
      url: file.path // Path that can be used to access the file
    }));
    
    // Group by directories
    const groupedFiles = {};
    formattedFiles.forEach(file => {
      const dirPath = path.dirname(file.path).replace(/^\/uploads\/?/, '') || 'root';
      if (!groupedFiles[dirPath]) {
        groupedFiles[dirPath] = [];
      }
      groupedFiles[dirPath].push(file);
    });
    
    res.status(200).json({
      success: true,
      data: {
        files: formattedFiles,
        grouped: groupedFiles,
        total: formattedFiles.length,
        totalSize: formatFileSize(formattedFiles.reduce((acc, file) => acc + file.size, 0))
      }
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve media files',
      error: error.message
    });
  }
};

// Delete a media file
export const deleteMedia = async (req, res) => {
  try {
    const { filepath } = req.params;
    
    // Verify file exists within uploads directory
    const fullPath = path.join(process.cwd(), 'uploads', filepath);
    const normalizedRequestedPath = path.normalize(fullPath);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Security check: Ensure the path is within the uploads directory
    if (!normalizedRequestedPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Attempted to access file outside uploads directory'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(normalizedRequestedPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete the file
    await unlink(normalizedRequestedPath);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media file',
      error: error.message
    });
  }
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};
