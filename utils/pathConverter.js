/**
 * Utility to convert file system paths to accessible URLs
 */

/**
 * Convert absolute file path to URL
 * @param {string} filePath - Absolute or relative file path
 * @returns {string|null} - Full URL or null if no path provided
 */
const convertPathToUrl = (filePath) => {
  if (!filePath) return null;
  
  // If already a URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If already a relative path starting with /, just prepend base URL
  if (filePath.startsWith('/uploads')) {
    const baseUrl = process.env.BASE_URL || 'https://cwtakarnataka.com';
    return `${baseUrl}${filePath}`;
  }
  
  // Extract the relative path from absolute path
  // Example: /home/cwtakarnataka/public_html/uploads/techniques/image-xxx.png
  // Should become: https://cwtakarnataka.com/uploads/techniques/image-xxx.png
  const uploadsIndex = filePath.indexOf('uploads');
  if (uploadsIndex !== -1) {
    const relativePath = filePath.substring(uploadsIndex);
    const baseUrl = process.env.BASE_URL || 'https://cwtakarnataka.com';
    return `${baseUrl}/${relativePath}`;
  }
  
  // If no uploads path found, return as is
  return filePath;
};

/**
 * Convert absolute file path to relative path
 * @param {string} filePath - Absolute file path
 * @returns {string|null} - Relative path starting with /uploads or null
 */
const convertToRelativePath = (filePath) => {
  if (!filePath) return null;
  
  // If already a URL, extract the path
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    try {
      const url = new URL(filePath);
      return url.pathname;
    } catch (e) {
      return filePath;
    }
  }
  
  // If already a relative path, return as is
  if (filePath.startsWith('/uploads')) {
    return filePath;
  }
  
  // Extract relative path from absolute path
  const uploadsIndex = filePath.indexOf('uploads');
  if (uploadsIndex !== -1) {
    return '/' + filePath.substring(uploadsIndex);
  }
  
  return filePath;
};

/**
 * Transform document with file paths to URLs
 * @param {Object} doc - Mongoose document or plain object
 * @param {Array<string>} fields - Array of field names to transform
 * @returns {Object} - Transformed object
 */
const transformDocumentPaths = (doc, fields = ['image', 'videoUrl', 'filePath']) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  
  fields.forEach(field => {
    if (obj[field]) {
      obj[field] = convertPathToUrl(obj[field]);
    }
  });
  
  return obj;
};

module.exports = {
  convertPathToUrl,
  convertToRelativePath,
  transformDocumentPaths
};
