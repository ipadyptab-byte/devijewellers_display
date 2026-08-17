const fs = require('fs');
let code = fs.readFileSync('src/components/MediaManager.tsx', 'utf8');

const regex = /\/\/ Convert file to Base64[\s\S]*?reader\.readAsDataURL\(file\);/;

const replacement = `// Convert file to Base64 (with compression for images to avoid Vercel 4.5MB payload limit)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions (e.g. 1920x1080)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality to keep size well under 1-2MB
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewUrl(dataUrl);
          
          // Update displayed file size after compression approximation
          const approxSizeMB = (dataUrl.length * (3/4)) / (1024 * 1024);
          setUploadedFileSize(approxSizeMB.toFixed(2) + ' MB (Compressed)');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // For videos or other files, we just read as base64 but warn if > 4MB
      if (file.size > 4 * 1024 * 1024) {
        alert("Warning: Video file is larger than 4MB. Vercel serverless functions have a 4.5MB payload limit and this upload may fail. Consider hosting the video on YouTube/Vimeo/Cloudinary and pasting the URL directly instead.");
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/MediaManager.tsx', code);
  console.log("Patched processFile to compress images.");
} else {
  console.log("Failed to find processFile regex.");
}
