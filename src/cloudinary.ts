// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dj17bvccd';
const CLOUDINARY_UPLOAD_PRESET = 'chat_unsigned';

export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.secure_url) {
          resolve(response.secure_url);
        } else {
          reject(new Error('Upload failed: No secure URL returned'));
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };
    
    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`Upload progress: ${percentComplete}%`);
      }
    };
    
    xhr.send(formData);
  });
};

export const getCloudinaryConfig = () => ({
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET
});
