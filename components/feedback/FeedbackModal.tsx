'use client';

import { useState } from 'react';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/ui/Spinner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'feature', label: '기능 요청', emoji: '💡' },
  { value: 'bug', label: '버그 제보', emoji: '🐛' },
  { value: 'other', label: '기타', emoji: '💬' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentLength = content.trim().length;
  const isValid = category !== null && contentLength >= 5 && contentLength <= 500;

  function reset() {
    setCategory(null);
    setContent('');
    setIsSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || '제출에 실패했습니다.', 'error');
        return;
      }

      showToast('소중한 의견 감사합니다!', 'success');
      handleClose();
    } catch {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={handleClose}
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        role="document"
        className={cn(
          'relative w-full max-w-md p-6',
          themeClass(
            'bg-[#fffbeb] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
            'bg-white rounded-xl shadow-xl border border-gray-200'
          )
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn(
            'text-lg font-bold',
            themeClass('uppercase tracking-wide', 'text-gray-900')
          )}>
            의견 보내기
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'w-8 h-8 flex items-center justify-center text-lg',
              themeClass(
                'border-2 border-black bg-white hover:bg-red-100 font-black',
                'text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
              )
            )}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className={cn(
            'text-sm mb-2',
            themeClass('font-bold', 'text-gray-600 font-medium')
          )}>
            카테고리
          </p>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'flex-1 py-2 px-3 text-sm transition-colors',
                  themeClass(
                    cn(
                      'border-2 border-black font-bold',
                      category === cat.value
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-gray-100'
                    ),
                    cn(
                      'rounded-lg border',
                      category === cat.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )
                  )
                )}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className={cn(
            'text-sm mb-2',
            themeClass('font-bold', 'text-gray-600 font-medium')
          )}>
            내용
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="개선할 점이나 원하는 기능을 자유롭게 적어주세요 (5자 이상)"
            rows={4}
            maxLength={500}
            className={cn(
              'w-full resize-none text-sm p-3',
              themeClass(
                'border-2 border-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black',
                'border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )
            )}
          />
          <p className={cn(
            'text-xs mt-1 text-right',
            themeClass('font-mono', 'text-gray-400')
          )}>
            {contentLength}/500
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            'w-full py-3 text-sm font-bold transition-colors',
            themeClass(
              cn(
                'border-2 border-black',
                isValid && !isSubmitting
                  ? 'bg-black text-white hover:bg-gray-800 active:translate-x-[2px] active:translate-y-[2px]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              ),
              cn(
                'rounded-lg',
                isValid && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )
            )
          )}
        >
          {isSubmitting ? <><Spinner className="inline" /> 제출 중...</> : '제출하기'}
        </button>
      </div>
    </div>
  );
}
