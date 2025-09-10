const API_BASE_URL = 'http://localhost:5000';

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads, construct the full URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in the uploads directory
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

export const getPostImageUrl = (imagePath: string): string => {
  return getImageUrl(imagePath);
};

export const getEventImageUrl = (imagePath: string): string => {
  return getImageUrl(imagePath);
};
