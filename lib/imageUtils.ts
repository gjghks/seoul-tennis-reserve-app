const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기가 5MB를 초과합니다.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다.');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context 생성 실패'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 압축 실패'));
            return;
          }

          resolve({
            blob,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
          });
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
}

export function generateImagePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${userId}/${timestamp}-${sanitizedName}`;
}

export function getPublicUrl(bucketName: string, path: string, supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}
