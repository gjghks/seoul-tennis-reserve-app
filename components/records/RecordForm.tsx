'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/Spinner';
import ScoreInput from '@/components/records/ScoreInput';
import MatchTypeSelect from '@/components/records/MatchTypeSelect';
import CourtLocationInput from '@/components/records/CourtLocationInput';
import type {
  GameRecord,
  MatchType,
  MatchFormat,
  MatchResult,
  MatchScore,
  CourtSurface,
  LocationType,
} from '@/lib/constants/tennis';
import {
  MATCH_FORMAT_OPTIONS,
  MATCH_RESULT_OPTIONS,
  COURT_SURFACE_OPTIONS,
} from '@/lib/constants/tennis';
import { validateScore, inferResult } from '@/lib/utils/tennis';
import { compressImage, generateImagePath, getPublicUrl } from '@/lib/imageUtils';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImagePreview {
  id: string;
  file?: File; // New files have a File object
  preview: string; // URL for preview (blob or remote)
  isExisting?: boolean; // Flag for existing images in edit mode
}

interface RecordFormProps {
  mode: 'create' | 'edit';
  initialData?: GameRecord;
  onSuccess?: (record: GameRecord) => void;
  onCancel?: () => void;
}

export default function RecordForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: RecordFormProps) {
  const { user } = useAuth();
  const themeClass = useThemeClass();
  const searchParams = useSearchParams();
  
  // Form State
  const [playedAt, setPlayedAt] = useState(
    initialData?.played_at 
      ? new Date(initialData.played_at).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  );
  const [matchType, setMatchType] = useState<MatchType>(initialData?.match_type || 'singles');
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(initialData?.match_format || '6game_1set');
  
  // Location State
  const [locationType, setLocationType] = useState<LocationType>(initialData?.location_type || 'seoul_court');
  const [courtId, setCourtId] = useState<string | null>(initialData?.court_id || null);
  const [courtName, setCourtName] = useState<string>(initialData?.court_name || '');
  const [district, setDistrict] = useState<string | null>(initialData?.district || null);

  useEffect(() => {
    if (mode === 'create' && !initialData) {
      const courtNameParam = searchParams.get('courtName');
      const districtParam = searchParams.get('district');
      
      if (courtNameParam) {
        setCourtName(courtNameParam);
        setLocationType('custom');
      }
      
      if (districtParam) {
        setDistrict(districtParam);
      }
    }
  }, [mode, initialData, searchParams]);

  const [score, setScore] = useState<MatchScore>(initialData?.score || { sets: [{ my: 0, opp: 0 }] });
  const [result, setResult] = useState<MatchResult | null>(initialData?.result || null);
  const [isAutoInferred, setIsAutoInferred] = useState(false);
  
  const [courtSurface, setCourtSurface] = useState<CourtSurface | ''>(initialData?.court_surface || '');
  const [opponentName, setOpponentName] = useState(initialData?.opponent_name || '');
  const [opponentLevel, setOpponentLevel] = useState(initialData?.opponent_level || '');
  const [durationMinutes, setDurationMinutes] = useState<string>(initialData?.duration_minutes?.toString() || '');
  const [cost, setCost] = useState<string>(initialData?.cost?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  // Image State
  const [images, setImages] = useState<ImagePreview[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((url, index) => ({
        id: `existing-${index}`,
        preview: url,
        isExisting: true,
      }));
    }
    return [];
  });

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (prevScoreRef.current === score) return;
    prevScoreRef.current = score;
    const inferred = inferResult(score);
    if (inferred) {
      setResult(inferred);
      setIsAutoInferred(true);
    }
  }, [score]);

  // Reset auto-inferred flag if user manually changes result
  const handleResultChange = (newResult: MatchResult) => {
    setResult(newResult);
    setIsAutoInferred(false);
  };

  // Image Handling
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
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        file,
        preview,
        isExisting: false,
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
      if (imageToRemove && !imageToRemove.isExisting) {
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

  const uploadNewImages = async (): Promise<string[]> => {
    if (!user) return [];
    
    const newImagesToUpload = images.filter(img => !img.isExisting && img.file);
    if (newImagesToUpload.length === 0) return [];

    const uploadedUrls: string[] = [];
    setUploadProgress(`이미지 압축 중... (0/${newImagesToUpload.length})`);

    for (let i = 0; i < newImagesToUpload.length; i++) {
      const img = newImagesToUpload[i];
      if (!img.file) continue;

      setUploadProgress(`이미지 압축 중... (${i + 1}/${newImagesToUpload.length})`);

      try {
        const compressed = await compressImage(img.file);
        const path = generateImagePath(user.id, img.file.name.replace(/\.[^.]+$/, '.webp'));

        setUploadProgress(`업로드 중... (${i + 1}/${newImagesToUpload.length})`);

        const { error: uploadError } = await supabase.storage
          .from('record-images')
          .upload(path, compressed.blob, {
            contentType: 'image/webp',
            upsert: false,
          });

         if (uploadError) {
           throw new Error(`이미지 업로드 실패: ${img.file.name}`);
        }

        const publicUrl = getPublicUrl(
          'record-images',
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
    if (!user) return;

    // Validation
    if (!courtName.trim()) {
      setError('장소(코트 이름)를 입력해주세요.');
      return;
    }
    
    const scoreValidation = validateScore(score);
    if (!scoreValidation.valid) {
      setError(scoreValidation.error || '스코어가 올바르지 않습니다.');
      return;
    }

    if (!result) {
      setError('경기 결과를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload new images
      const newImageUrls = await uploadNewImages();
      
      // 2. Combine existing images and new images
      const existingImageUrls = images
        .filter(img => img.isExisting)
        .map(img => img.preview);
        
      const finalImageUrls = [...existingImageUrls, ...newImageUrls];

      // 3. Prepare payload
      const payload = {
        played_at: new Date(playedAt).toISOString(),
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        location_type: locationType,
        court_id: courtId,
        court_name: courtName,
        district: district,
        match_type: matchType,
        match_format: matchFormat,
        score: score,
        result: result,
        court_surface: courtSurface || null,
        opponent_name: opponentName || null,
        opponent_level: opponentLevel || null,
        cost: cost ? parseInt(cost, 10) : null,
        notes: notes || null,
        images: finalImageUrls,
      };

      // 4. Send request
      const url = mode === 'create' ? '/api/records' : `/api/records/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '기록 저장에 실패했습니다.');
      }

      onSuccess?.(data.record);
    } catch (err) {
      setError(err instanceof Error ? err.message : '기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Common Styles
  const labelClass = themeClass(
    'block mb-2 font-bold text-black text-lg',
    'block mb-1.5 font-medium text-gray-700 text-sm'
  );
  
  const inputClass = themeClass(
    'w-full p-3 border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 shadow-[4px_4px_0px_0px_#000] transition-all',
    'w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
  );

  const sectionClass = 'space-y-6';

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto pb-20">
      <div className={sectionClass}>
        
        {/* 1. Date/Time */}
        <div>
          <label htmlFor="played_at" className={labelClass}>날짜/시간</label>
          <input
            type="datetime-local"
            id="played_at"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {/* 2. Match Type */}
        <div>
          <span className={labelClass}>경기 유형</span>
          <MatchTypeSelect value={matchType} onChange={setMatchType} />
        </div>

        {/* 3. Match Format */}
        <div>
          <span className={labelClass}>경기 형식</span>
          <div className="flex flex-wrap gap-2">
            {MATCH_FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMatchFormat(option.value)}
                className={cn(
                  'px-3 py-2 text-sm transition-all',
                  themeClass(
                    `border-2 border-black rounded-[5px] font-bold ${
                      matchFormat === option.value
                        ? 'bg-[#88aaee] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]'
                        : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                    }`,
                    `rounded-full border ${
                      matchFormat === option.value
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`
                  )
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Location */}
        <div>
          <span className={labelClass}>장소</span>
          <CourtLocationInput
            locationType={locationType}
            courtId={courtId}
            courtName={courtName}
            district={district}
            onChange={(data) => {
              setLocationType(data.locationType);
              setCourtId(data.courtId);
              setCourtName(data.courtName);
              setDistrict(data.district);
            }}
          />
        </div>

        {/* 5. Score */}
        <div>
          <span className={labelClass}>스코어</span>
          <ScoreInput score={score} onChange={setScore} />
        </div>

        {/* 6. Result */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={themeClass('font-bold text-black text-lg', 'font-medium text-gray-700 text-sm')}>
              경기 결과
            </span>
            {isAutoInferred && (
              <span className={themeClass(
                'text-xs px-2 py-0.5 bg-[#facc15] border border-black rounded-[3px] font-bold',
                'text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium'
              )}>
                스코어에서 자동 추론됨
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {MATCH_RESULT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleResultChange(option.value)}
                className={cn(
                  'flex-1 px-3 py-3 text-sm transition-all',
                  themeClass(
                    `border-2 border-black rounded-[5px] font-bold ${
                      result === option.value
                        ? 'bg-[#a3e635] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]'
                        : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                    }`,
                    `rounded-lg border ${
                      result === option.value
                        ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`
                  )
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Court Surface */}
        <div>
          <label htmlFor="court_surface" className={labelClass}>코트 표면</label>
          <select
            id="court_surface"
            value={courtSurface}
            onChange={(e) => setCourtSurface(e.target.value as CourtSurface | '')}
            className={inputClass}
          >
            <option value="">선택 안 함</option>
            {COURT_SURFACE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 8. Opponent Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="opponent_name" className={labelClass}>상대 이름</label>
            <input
              type="text"
              id="opponent_name"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="상대 이름"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="opponent_level" className={labelClass}>상대 수준</label>
            <input
              type="text"
              id="opponent_level"
              value={opponentLevel}
              onChange={(e) => setOpponentLevel(e.target.value)}
              placeholder="예: 초급, NTRP 3.0"
              className={inputClass}
            />
          </div>
        </div>

        {/* 9. Duration */}
        <div>
          <label htmlFor="duration_minutes" className={labelClass}>경기 시간 (분)</label>
          <input
            type="number"
            id="duration_minutes"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            min="0"
            max="600"
            placeholder="분 단위 입력"
            className={inputClass}
          />
        </div>

        {/* 10. Cost */}
        <div>
          <label htmlFor="cost" className={labelClass}>비용 (원)</label>
          <input
            type="number"
            id="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            min="0"
            placeholder="원 단위 입력"
            className={inputClass}
          />
        </div>

        {/* 11. Images */}
        <div>
          <span className={labelClass}>
            사진 <span className="text-gray-400 font-normal text-sm">(최대 {MAX_IMAGES}장)</span>
          </span>
          
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              'relative block border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
              themeClass(
                'border-black/30 hover:border-black/60 bg-gray-50 rounded-[5px]',
                'border-gray-200 hover:border-gray-400 bg-gray-50 rounded-lg'
              ),
              images.length >= MAX_IMAGES && 'opacity-50 cursor-not-allowed'
            )}
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
              <svg className={themeClass('w-8 h-8 text-black/40', 'w-8 h-8 text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className={themeClass('text-sm text-black/60', 'text-sm text-gray-500')}>
                클릭하거나 이미지를 드래그하세요
              </p>
            </div>
          </label>

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={cn(
                    'relative aspect-square overflow-hidden',
                    themeClass('border-2 border-black rounded-[5px]', 'border border-gray-200 rounded-lg')
                  )}
                >
                  <img
                    src={img.preview}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className={cn(
                      'absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                      themeClass('bg-black text-white hover:bg-red-600', 'bg-black/50 text-white hover:bg-red-500')
                    )}
                    aria-label="이미지 삭제"
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

        {/* 12. Notes */}
        <div>
          <label htmlFor="notes" className={labelClass}>메모</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            rows={4}
            className={cn(inputClass, 'resize-none')}
            placeholder="경기 내용이나 특이사항을 기록하세요."
          />
          <div className={themeClass('text-right text-sm mt-1 text-black/60', 'text-right text-sm mt-1 text-gray-400')}>
            {notes.length}/1000
          </div>
        </div>

        {/* Status Messages */}
        {uploadProgress && (
          <div className={themeClass(
            'p-3 text-sm flex items-center gap-2 bg-blue-100 border-2 border-black rounded-[5px] text-blue-700 font-medium',
            'p-3 text-sm flex items-center gap-2 bg-blue-50 rounded-lg text-blue-600'
          )}>
            <Spinner className="w-4 h-4 border-blue-600 border-t-transparent" />
            {uploadProgress}
          </div>
        )}

        {error && (
          <div role="alert" className={themeClass(
            'p-3 text-sm bg-red-100 border-2 border-black rounded-[5px] text-red-700 font-medium',
            'p-3 text-sm bg-red-50 rounded-lg text-red-600'
          )}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={cn(
              'flex-1 py-3 font-bold transition-all',
              themeClass(
                'bg-white border-2 border-black rounded-[5px] text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]',
                'bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              )
            )}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex-[2] py-3 font-bold transition-all',
              themeClass(
                `border-2 border-black rounded-[5px] ${
                  isSubmitting
                    ? 'bg-gray-200 text-black/40 cursor-not-allowed'
                    : 'bg-[#22c55e] text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                }`,
                `rounded-lg ${
                  isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`
              )
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="inline w-4 h-4 border-current border-t-transparent" />
                저장 중...
              </span>
            ) : (
              mode === 'create' ? '기록 저장' : '수정 완료'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
