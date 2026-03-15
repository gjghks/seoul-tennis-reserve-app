'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { DISTRICTS } from '@/lib/constants/districts';
import { useAuth } from '@/contexts/AuthContext';

export default function TransferForm() {
  const router = useRouter();
  const themeClass = useThemeClass();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    court_name: '',
    district: DISTRICTS[0].nameKo,
    play_date: new Date().toISOString().split('T')[0],
    play_time_start: '',
    play_time_end: '',
    original_price: '',
    asking_price: '',
    is_free: false,
    description: '',
    contact_type: 'kakao' as 'kakao' | 'phone',
    contact_info: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if (name === 'is_free' && checked) {
        setFormData((prev) => ({ ...prev, asking_price: '0' }));
      }
    } else if (type === 'radio') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === 'contact_type') {
        setFormData((prev) => ({ ...prev, contact_info: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          court_name: formData.court_name,
          district: formData.district,
          play_date: formData.play_date,
          play_time_start: formData.play_time_start,
          play_time_end: formData.play_time_end || null,
          original_price: Number(formData.original_price) || 0,
          asking_price: formData.is_free ? 0 : Number(formData.asking_price) || 0,
          is_free: formData.is_free,
          description: formData.description || null,
          contact_type: formData.contact_type,
          contact_info: formData.contact_info || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '등록에 실패했습니다.');
      }

      router.push('/transfers');
    } catch (err) {
      alert(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className={cn('text-2xl font-black', themeClass('text-black', 'text-gray-900'))}>
            양도글 작성
          </h1>
          <Link
            href="/guide/transfers"
            className={cn(
              'flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-all',
              themeClass(
                'bg-[#facc15] border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                'bg-green-50 text-green-700 font-semibold border border-green-200 hover:bg-green-100'
              )
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>사용법</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="예: 보라매공원 테니스장 주말 양도합니다"
                value={formData.title}
                onChange={handleChange}
                className={cn(
                  'w-full p-3 rounded-lg outline-none transition-colors',
                  themeClass(
                    'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                    'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  )
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="district" className="block text-sm font-bold text-gray-700 mb-1">
                  지역 <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className={cn(
                    'w-full p-3 rounded-lg outline-none transition-colors',
                    themeClass(
                      'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                      'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    )
                  )}
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.nameKo}>
                      {d.nameKo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="court_name" className="block text-sm font-bold text-gray-700 mb-1">
                  코트 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="court_name"
                  name="court_name"
                  type="text"
                  required
                  placeholder="예: 보라매공원"
                  value={formData.court_name}
                  onChange={handleChange}
                  className={cn(
                    'w-full p-3 rounded-lg outline-none transition-colors',
                    themeClass(
                      'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                      'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    )
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="play_date" className="block text-sm font-bold text-gray-700 mb-1">
                  날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  id="play_date"
                  name="play_date"
                  type="date"
                  required
                  value={formData.play_date}
                  onChange={handleChange}
                  className={cn(
                    'w-full p-3 rounded-lg outline-none transition-colors',
                    themeClass(
                      'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                      'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    )
                  )}
                />
              </div>
              <div>
                <label htmlFor="play_time_start" className="block text-sm font-bold text-gray-700 mb-1">
                  시작 시간 <span className="text-red-500">*</span>
                </label>
                <input
                  id="play_time_start"
                  name="play_time_start"
                  type="time"
                  required
                  value={formData.play_time_start}
                  onChange={handleChange}
                  className={cn(
                    'w-full p-3 rounded-lg outline-none transition-colors',
                    themeClass(
                      'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                      'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    )
                  )}
                />
              </div>
              <div>
                <label htmlFor="play_time_end" className="block text-sm font-bold text-gray-700 mb-1">
                  종료 시간
                </label>
                <input
                  id="play_time_end"
                  name="play_time_end"
                  type="time"
                  value={formData.play_time_end}
                  onChange={handleChange}
                  className={cn(
                    'w-full p-3 rounded-lg outline-none transition-colors',
                    themeClass(
                      'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                      'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    )
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="original_price" className="block text-sm font-bold text-gray-700 mb-1">
                  원가 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="original_price"
                    name="original_price"
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.original_price}
                    onChange={handleChange}
                    className={cn(
                      'w-full p-3 pr-8 rounded-lg outline-none transition-colors',
                      themeClass(
                        'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                        'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      )
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="asking_price" className="block text-sm font-bold text-gray-700">
                    양도가 <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_free"
                      checked={formData.is_free}
                      onChange={handleChange}
                      className={cn(
                        'w-4 h-4 rounded cursor-pointer',
                        themeClass('border-black accent-black', 'border-gray-300 text-blue-600')
                      )}
                    />
                    <span className={cn('font-bold', themeClass('text-black', 'text-gray-700'))}>무료 나눔</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="asking_price"
                    name="asking_price"
                    type="number"
                    min="0"
                    required
                    disabled={formData.is_free}
                    placeholder="0"
                    value={formData.asking_price}
                    onChange={handleChange}
                    className={cn(
                      'w-full p-3 pr-8 rounded-lg outline-none transition-colors',
                      formData.is_free && 'opacity-50 bg-gray-100',
                      themeClass(
                        'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                        'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      )
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
                </div>
              </div>
            </div>

            <div className={cn(
              'p-4 rounded-lg space-y-3',
              themeClass('bg-blue-50 border-2 border-black', 'bg-blue-50 border border-blue-200')
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔒</span>
                <span className={cn('text-sm font-bold', themeClass('text-black', 'text-gray-900'))}>
                  연락처 (승인된 상대에게만 공개)
                </span>
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="contact_type"
                    value="kakao"
                    checked={formData.contact_type === 'kakao'}
                    onChange={handleChange}
                    className={cn('w-4 h-4 cursor-pointer', themeClass('accent-black', 'text-blue-600'))}
                  />
                  <span className={cn('text-sm font-bold', themeClass('text-black', 'text-gray-700'))}>카카오톡 ID</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="contact_type"
                    value="phone"
                    checked={formData.contact_type === 'phone'}
                    onChange={handleChange}
                    className={cn('w-4 h-4 cursor-pointer', themeClass('accent-black', 'text-blue-600'))}
                  />
                  <span className={cn('text-sm font-bold', themeClass('text-black', 'text-gray-700'))}>전화번호</span>
                </label>
              </div>
              <input
                name="contact_info"
                type={formData.contact_type === 'phone' ? 'tel' : 'text'}
                placeholder={formData.contact_type === 'kakao' ? '카카오톡 ID를 입력하세요' : '전화번호를 입력하세요'}
                value={formData.contact_info}
                onChange={handleChange}
                className={cn(
                  'w-full p-3 rounded-lg outline-none transition-colors',
                  themeClass(
                    'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                    'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  )
                )}
              />
              <p className={cn('text-xs', themeClass('text-black/50 font-medium', 'text-gray-400'))}>
                관심 표시 후 승인한 상대에게만 공개됩니다
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">
                상세 내용
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="코트 종류, 거래 방식 등 필요한 내용을 적어주세요."
                value={formData.description}
                onChange={handleChange}
                className={cn(
                  'w-full p-3 rounded-lg outline-none transition-colors resize-none',
                  themeClass(
                    'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000]',
                    'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  )
                )}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                'flex-1 py-3.5 rounded-lg font-bold transition-all',
                themeClass(
                  'bg-white text-black border-2 border-black hover:-translate-y-[2px] shadow-[4px_4px_0px_0px_#000]',
                  'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                )
              )}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'flex-1 py-3.5 rounded-lg font-bold transition-all text-white',
                isSubmitting && 'opacity-70 cursor-not-allowed',
                themeClass(
                  'bg-black border-2 border-black hover:-translate-y-[2px] shadow-[4px_4px_0px_0px_#000]',
                  'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                )
              )}
            >
              {isSubmitting ? '등록 중...' : '양도글 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}