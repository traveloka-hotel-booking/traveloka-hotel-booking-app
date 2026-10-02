// Cấu hình Cloudinary dùng chung cho hệ thống Traveloka
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'efddn40s';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '355369716636389';
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'AFdh-X6AXmjKr4G7NkVkxHipxSk';

// Hàm tính mã băm SHA-1 bằng Web Crypto API tích hợp sẵn trong trình duyệt
async function sha1(str) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash))
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Tải file hình ảnh (MultipartFile) lên Cloudinary
 * @param {File|Blob} file Tập tin ảnh người dùng chọn
 * @param {string} folder Thư mục đích trên Cloudinary (mặc định: 'traveloka/hotels')
 * @returns {Promise<string>} Đường dẫn URL ảnh an toàn (secure_url)
 */
export async function uploadToCloudinary(file, folder = 'traveloka/hotels') {
  if (!file) {
    throw new Error('Chưa chọn tập tin để tải lên');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const strToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  const signature = await sha1(strToSign);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể tải ảnh lên Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}
