'use client';

import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn, useThemeClass } from '@/lib/cn';
import Spinner from '@/components/ui/Spinner';
import MatchTypeSelect from '@/components/records/MatchTypeSelect';
import CourtLocationInput from '@/components/records/CourtLocationInput';
import RecordScoreSection from '@/components/records/RecordScoreSection';
import RecordOptionalDetailsSection from '@/components/records/RecordOptionalDetailsSection';
import RecordImageUploader, {
  type RecordImageUploaderHandle,
} from '@/components/records/RecordImageUploader';
import useRecordForm from '@/components/records/useRecordForm';
import type { GameRecord } from '@/lib/constants/tennis';
import { MATCH_FORMAT_OPTIONS } from '@/lib/constants/tennis';

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
  const { showToast } = useToast();
  const themeClass = useThemeClass();
  const searchParams = useSearchParams();
  const imageUploaderRef = useRef<RecordImageUploaderHandle>(null);

  const form = useRecordForm({
    mode,
    initialData,
    onSuccess,
    user,
    showToast,
    prefillCourtName: searchParams.get('courtName'),
    prefillDistrict: searchParams.get('district'),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await form.submit(async () => {
      if (!imageUploaderRef.current) {
        return initialData?.images || [];
      }
      return imageUploaderRef.current.uploadAndGetImageUrls();
    });
  };

  const labelClass = themeClass(
    'block mb-2 font-bold text-black text-lg',
    'block mb-1.5 font-medium text-gray-700 text-sm'
  );

  const inputClass = themeClass(
    'w-full p-3 border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 shadow-[4px_4px_0px_0px_#000] transition-all',
    'w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto pb-20">
      <div className="space-y-6">
        <div>
          <label htmlFor="played_at" className={labelClass}>
            날짜/시간 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="played_at"
            value={form.state.playedAt}
            onChange={(event) => form.setPlayedAt(event.target.value)}
            required
            aria-invalid={!!form.state.validationErrors.playedAt}
            aria-describedby={
              form.state.validationErrors.playedAt ? 'played_at-error' : undefined
            }
            className={inputClass}
          />
          {form.state.validationErrors.playedAt && (
            <p id="played_at-error" className="text-red-500 text-xs mt-1" role="alert">
              {form.state.validationErrors.playedAt}
            </p>
          )}
        </div>

        <div>
          <span className={labelClass}>경기 유형</span>
          <MatchTypeSelect value={form.state.matchType} onChange={form.setMatchType} />
        </div>

        <div>
          <span className={labelClass}>경기 형식</span>
          <div className="flex flex-wrap gap-2">
            {MATCH_FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => form.setMatchFormat(option.value)}
                className={cn(
                  'px-3 py-2 text-sm transition-all',
                  themeClass(
                    `border-2 border-black rounded-[5px] font-bold ${
                      form.state.matchFormat === option.value
                        ? 'bg-[#88aaee] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]'
                        : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                    }`,
                    `rounded-full border ${
                      form.state.matchFormat === option.value
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

        <div>
          <span className={labelClass}>장소</span>
          <CourtLocationInput
            locationType={form.state.locationType}
            courtId={form.state.courtId}
            courtName={form.state.courtName}
            district={form.state.district}
            onChange={form.setLocation}
          />
        </div>

        <RecordScoreSection
          labelClass={labelClass}
          score={form.state.score}
          onScoreChange={form.setScore}
          result={form.state.result}
          isAutoInferred={form.state.isAutoInferred}
          onResultChange={form.setResult}
        />

        <RecordOptionalDetailsSection
          courtSurface={form.state.courtSurface}
          onCourtSurfaceChange={form.setCourtSurface}
          opponentName={form.state.opponentName}
          onOpponentNameChange={form.setOpponentName}
          opponentLevel={form.state.opponentLevel}
          onOpponentLevelChange={form.setOpponentLevel}
          durationMinutes={form.state.durationMinutes}
          onDurationMinutesChange={form.setDurationMinutes}
          cost={form.state.cost}
          onCostChange={form.setCost}
          notes={form.state.notes}
          onNotesChange={form.setNotes}
        />

        <RecordImageUploader
          ref={imageUploaderRef}
          labelClass={labelClass}
          userId={user?.id}
          initialImages={initialData?.images}
          onErrorChange={form.handleErrorChange}
          onUploadProgressChange={form.handleUploadProgressChange}
        />

        {form.uploadProgress && (
          <div
            className={themeClass(
              'p-3 text-sm flex items-center gap-2 bg-blue-100 border-2 border-black rounded-[5px] text-blue-700 font-medium',
              'p-3 text-sm flex items-center gap-2 bg-blue-50 rounded-lg text-blue-600'
            )}
          >
            <Spinner className="w-4 h-4 border-blue-600 border-t-transparent" />
            {form.uploadProgress}
          </div>
        )}

        {form.error && (
          <div
            role="alert"
            className={themeClass(
              'p-3 text-sm bg-red-100 border-2 border-black rounded-[5px] text-red-700 font-medium',
              'p-3 text-sm bg-red-50 rounded-lg text-red-600'
            )}
          >
            {form.error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={form.isSubmitting}
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
            disabled={form.isSubmitting}
            className={cn(
              'flex-[2] py-3 font-bold transition-all',
              themeClass(
                `border-2 border-black rounded-[5px] ${
                  form.isSubmitting
                    ? 'bg-gray-200 text-black/60 cursor-not-allowed'
                    : 'bg-[#22c55e] text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                }`,
                `rounded-lg ${
                  form.isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`
              )
            )}
          >
            {form.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="inline w-4 h-4 border-current border-t-transparent" />
                저장 중...
              </span>
            ) : mode === 'create' ? (
              '기록 저장'
            ) : (
              '수정 완료'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
