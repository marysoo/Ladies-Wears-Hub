/**
 * Resizes a base64 image to fit within a maximum dimension and quality.
 * This helps stay within Firestore's 1MB document limit.
 */
export const resizeImage = (
  base64Str: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.6
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with specified quality
      // JPEG is usually much smaller than PNG for photos
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Check size (approximate)
      const sizeInBytes = Math.floor((resizedBase64.length * 3) / 4);
      if (sizeInBytes > 300000) { // If still over 300KB, try even lower quality
        const evenSmaller = canvas.toDataURL('image/jpeg', 0.4);
        resolve(evenSmaller);
      } else {
        resolve(resizedBase64);
      }
    };
    img.onerror = (err) => reject(err);
  });
};
