'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { cn, useThemeClass } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import { compressImage, generateImagePath, getPublicUrl } from '@/lib/imageUtils';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ImagePreview {
  id: string;
  file?: File;
  preview: string;
  isExisting?: boolean;
}

interface RecordImageUploaderProps {
  labelClass: string;
  userId?: string;
  initialImages?: string[];
  onErrorChange: (message: string | null) => void;
  onUploadProgressChange: (progress: string | null) => void;
}

export interface RecordImageUploaderHandle {
  uploadAndGetImageUrls: () => Promise<string[]>;
}

const RecordImageUploader = forwardRef<RecordImageUploaderHandle, RecordImageUploaderProps>(
  ({ labelClass, userId, initialImages = [], onErrorChange, onUploadProgressChange }, ref) => {
    const themeClass = useThemeClass();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<ImagePreview[]>(() =>
      initialImages.map((url, index) => ({
        id: `existing-${index}`,
        preview: url,
        isExisting: true,
      }))
    );

    const handleFileSelect = useCallback(
      async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_IMAGES - images.length;
        if (remainingSlots <= 0) {
          onErrorChange(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
          return;
        }

        const filesToAdd = Array.from(files).slice(0, remainingSlots);
        const newImages: ImagePreview[] = [];

        for (const file of filesToAdd) {
          if (file.size > MAX_FILE_SIZE) {
            onErrorChange(`${file.name}: 파일 크기가 5MB를 초과합니다.`);
            continue;
          }

          if (!file.type.startsWith('image/')) {
            onErrorChange(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
            continue;
          }

          const preview = URL.createObjectURL(file);
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            file,
            preview,
            isExisting: false,
          });
        }

        if (newImages.length > 0) {
          setImages((prev) => [...prev, ...newImages]);
          onErrorChange(null);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [images.length, onErrorChange]
    );

    const handleRemoveImage = useCallback((id: string) => {
      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === id);
        if (imageToRemove && !imageToRemove.isExisting) {
          URL.revokeObjectURL(imageToRemove.preview);
        }
        return prev.filter((img) => img.id !== id);
      });
    }, []);

    const handleDrop = useCallback(
      (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        handleFileSelect(event.dataTransfer.files);
      },
      [handleFileSelect]
    );

    const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
    }, []);

    const uploadAndGetImageUrls = useCallback(async (): Promise<string[]> => {
      const existingImageUrls = images.filter((img) => img.isExisting).map((img) => img.preview);

      if (!userId) return existingImageUrls;

      const newImagesToUpload = images.filter((img) => !img.isExisting && img.file);
      if (newImagesToUpload.length === 0) {
        return existingImageUrls;
      }

      const uploadedUrls: string[] = [];
      onUploadProgressChange(`이미지 압축 중... (0/${newImagesToUpload.length})`);

      for (let i = 0; i < newImagesToUpload.length; i++) {
        const image = newImagesToUpload[i];
        if (!image.file) continue;

        onUploadProgressChange(`이미지 압축 중... (${i + 1}/${newImagesToUpload.length})`);

        const compressed = await compressImage(image.file);
        const path = generateImagePath(userId, image.file.name.replace(/\.[^.]+$/, '.webp'));

        onUploadProgressChange(`업로드 중... (${i + 1}/${newImagesToUpload.length})`);

        const { error: uploadError } = await supabase.storage.from('record-images').upload(path, compressed.blob, {
          contentType: 'image/webp',
          upsert: false,
        });

        if (uploadError) {
          throw new Error(`이미지 업로드 실패: ${image.file.name}`);
        }

        const publicUrl = getPublicUrl(
          'record-images',
          path,
          process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        );
        uploadedUrls.push(publicUrl);
      }

      onUploadProgressChange(null);
      return [...existingImageUrls, ...uploadedUrls];
    }, [images, onUploadProgressChange, userId]);

    useImperativeHandle(
      ref,
      () => ({
        uploadAndGetImageUrls,
      }),
      [uploadAndGetImageUrls]
    );

    return (
      <div>
        <span className={labelClass}>
          사진 <span className="text-gray-400 dark:text-slate-500 font-normal text-sm">(선택, 최대 {MAX_IMAGES}장)</span>
        </span>

        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'relative block border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
            themeClass(
              'border-black/30 hover:border-black/60 bg-gray-50 dark:bg-slate-800 rounded-[5px]',
              'border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 bg-gray-50 dark:bg-slate-800 rounded-lg'
            ),
            images.length >= MAX_IMAGES && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="경기 사진 추가 (최대 5장, 각 5MB 이하)"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => handleFileSelect(event.target.files)}
            className="sr-only"
            disabled={images.length >= MAX_IMAGES}
            aria-label="경기 사진 파일 선택"
          />
          <div className="flex flex-col items-center gap-2">
            <svg
              className={themeClass('w-8 h-8 text-black/60 dark:text-slate-400', 'w-8 h-8 text-gray-400 dark:text-slate-500')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className={themeClass('text-sm text-black/60 dark:text-slate-400', 'text-sm text-gray-500 dark:text-slate-400')}>
              클릭하거나 이미지를 드래그하세요
            </p>
          </div>
        </label>

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  'relative aspect-square overflow-hidden',
                  themeClass('border-2 border-black rounded-[5px]', 'border border-gray-200 dark:border-slate-700 rounded-lg')
                )}
              >
                <Image
                  src={image.preview}
                  alt={`경기 사진 ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className={cn(
                    'absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                    themeClass('bg-black text-white hover:bg-red-600', 'bg-black/50 text-white hover:bg-red-500')
                  )}
                  aria-label={`경기 사진 ${index + 1} 삭제`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

RecordImageUploader.displayName = 'RecordImageUploader';

export default RecordImageUploader;
