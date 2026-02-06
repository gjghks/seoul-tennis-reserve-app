'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import LoginPrompt from '@/components/auth/LoginPrompt';
import { compressImage, generateImagePath, getPublicUrl } from '@/lib/imageUtils';
import { useThemeClass } from '@/lib/cn';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
}

interface ReviewFormProps {
  courtId: string;
  courtName: string;
  district: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ courtId, courtName, district, onReviewAdded }: ReviewFormProps) {
  const { user } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    const newImages: ImagePreview[] = [];

    for (const file of filesToAdd) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: 파일 크기가 5MB를 초과합니다.`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setError(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
      });
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      setError(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0 || !user) return [];

    const uploadedUrls: string[] = [];
    setUploadProgress(`이미지 압축 중... (0/${images.length})`);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setUploadProgress(`이미지 압축 중... (${i + 1}/${images.length})`);

      try {
        const compressed = await compressImage(img.file);
        const path = generateImagePath(user.id, img.file.name.replace(/\.[^.]+$/, '.webp'));

        setUploadProgress(`업로드 중... (${i + 1}/${images.length})`);

        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(path, compressed.blob, {
            contentType: 'image/webp',
            upsert: false,
          });

         if (uploadError) {
           throw new Error(`이미지 업로드 실패: ${img.file.name}`);
        }

        const publicUrl = getPublicUrl(
          'review-images',
          path,
          process.env.NEXT_PUBLIC_SUPABASE_URL!
        );
        uploadedUrls.push(publicUrl);
       } catch (err) {
         throw err;
      }
    }

    setUploadProgress(null);
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (content.length < 10) {
      setError('후기는 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageUrls = await uploadImages();

      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          court_id: courtId,
          court_name: courtName,
          district,
          rating,
          content,
          images: imageUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '후기 작성에 실패했습니다.');
      }

      setContent('');
      setRating(5);
      for (const img of images) {
        URL.revokeObjectURL(img.preview);
      }
      setImages([]);
      onReviewAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : '후기 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const StarButton = ({ value }: { value: number }) => (
    <button
      type="button"
      onClick={() => setRating(value)}
      className={`text-2xl transition-colors ${
        value <= rating ? 'text-yellow-400' : 'text-gray-300'
      } hover:scale-110`}
      aria-label={`${value}점`}
    >
      ★
    </button>
  );

  if (!user) {
    return (
      <>
        <div className={`p-4 text-center ${themeClass('bg-gray-100 border-2 border-black rounded-[5px]', 'bg-gray-50 rounded-xl')} `}>
          <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>
            후기를 작성하려면{' '}
            <button
              type="button"
              onClick={() => setShowLoginPrompt(true)}
              className={themeClass('text-[#22c55e] font-bold underline underline-offset-2', 'text-green-600 font-medium hover:underline')}
            >
              로그인
            </button>
            이 필요합니다.
          </p>
        </div>
        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          message="후기를 작성하려면 로그인해주세요."
        />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`p-4 ${themeClass('bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white rounded-xl border border-gray-100 shadow-sm')} `}>
      <fieldset className="mb-4 border-none p-0 m-0">
        <legend className={`mb-2 ${themeClass('font-bold text-black', 'font-medium text-gray-700')} `}>
          평점
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarButton key={value} value={value} />
          ))}
          <span className={`ml-2 ${themeClass('font-bold', 'text-gray-600')} `}>
            {rating}점
          </span>
        </div>
      </fieldset>

      <div className="mb-4">
        <label htmlFor="review-content" className={`block mb-2 ${themeClass('font-bold text-black', 'font-medium text-gray-700')} `}>
          후기 내용
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이 테니스장에 대한 후기를 작성해주세요. (10자 이상)"
          maxLength={500}
          rows={4}
          className={`w-full p-3 resize-none ${themeClass('border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2', 'border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent')}`}
        />
        <div className={`text-right text-sm mt-1 ${themeClass('text-black/60', 'text-gray-400')} `}>
          {content.length}/500
        </div>
      </div>

      <div className="mb-4">
        <span className={`block mb-2 ${themeClass('font-bold text-black', 'font-medium text-gray-700')} `}>
          사진 첨부 <span className={themeClass('text-black/50 font-normal', 'text-gray-400 font-normal')}>(선택, 최대 {MAX_IMAGES}장)</span>
        </span>

        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`relative block border-2 border-dashed rounded-lg p-4 text-center transition-colors ${themeClass('border-black/30 hover:border-black/60 bg-gray-50', 'border-gray-200 hover:border-gray-400 bg-gray-50')} ${images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="sr-only"
            disabled={images.length >= MAX_IMAGES}
          />
          <div className="flex flex-col items-center gap-2">
            <svg className={`w-8 h-8 ${themeClass('text-black/40', 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-sm ${themeClass('text-black/60', 'text-gray-500')} `}>
              클릭하거나 이미지를 드래그하세요
            </p>
            <p className={`text-xs ${themeClass('text-black/40', 'text-gray-400')} `}>
              JPG, PNG, WebP (최대 5MB)
            </p>
          </div>
        </label>

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className={`relative aspect-square rounded-lg overflow-hidden ${themeClass('border-2 border-black', 'border border-gray-200')}`}
              >
                <img
                  src={img.preview}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${themeClass('bg-black text-white hover:bg-red-600', 'bg-black/50 text-white hover:bg-red-500')}`}
                  aria-label="이미지 삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadProgress && (
        <div className={`mb-4 p-3 text-sm flex items-center gap-2 ${themeClass('bg-blue-100 border-2 border-black rounded-[5px] text-blue-700 font-medium', 'bg-blue-50 rounded-lg text-blue-600')} `}>
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          {uploadProgress}
        </div>
      )}

      {error && (
        <div className={`mb-4 p-3 text-sm ${themeClass('bg-red-100 border-2 border-black rounded-[5px] text-red-700 font-medium', 'bg-red-50 rounded-lg text-red-600')} `}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || content.length < 10}
        className={`w-full py-3 font-bold transition-all ${themeClass(
          `border-2 border-black rounded-[5px] ${
            isSubmitting || content.length < 10
              ? 'bg-gray-200 text-black/40 cursor-not-allowed'
              : 'bg-[#22c55e] text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'
          }`,
          `rounded-lg ${
            isSubmitting || content.length < 10
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`
        )}`}
      >
        {isSubmitting ? '등록 중...' : '후기 등록'}
      </button>
    </form>
  );
}
