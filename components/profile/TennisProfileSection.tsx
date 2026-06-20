'use client';

import { useState, useEffect } from 'react';
import { useThemeClass, cn } from '@/lib/cn';
import { useTennisProfile } from '@/lib/hooks/useTennisProfile';
import type { PlayerProfile } from '@/lib/constants/tennis';
import {
  SKILL_LEVEL_OPTIONS,
  AGE_GROUP_OPTIONS,
  PREFERRED_HAND_OPTIONS,
  CAREER_YEARS_OPTIONS,
} from '@/lib/constants/tennis';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/ui/Spinner';

interface OptionValue<T extends string | number> {
  value: T;
  label: string;
}

export default function TennisProfileSection() {
  const themeClass = useThemeClass();
  const { profile, isLoading, updateProfile } = useTennisProfile();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PlayerProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        career_years: profile.career_years,
        ntrp_rating: profile.ntrp_rating,
        skill_level: profile.skill_level,
        preferred_hand: profile.preferred_hand,
        age_group: profile.age_group,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      showToast('프로필이 저장되었습니다', 'success');
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '프로필 저장 중 오류가 발생했습니다';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        career_years: profile.career_years,
        ntrp_rating: profile.ntrp_rating,
        skill_level: profile.skill_level,
        preferred_hand: profile.preferred_hand,
        age_group: profile.age_group,
      });
    } else {
      setFormData({});
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Spinner className="inline" />
      </div>
    );
  }

  const hasProfile = profile && (
    profile.career_years !== null ||
    profile.ntrp_rating !== null ||
    profile.skill_level !== null ||
    profile.preferred_hand !== null ||
    profile.age_group !== null
  );

  const getLabel = <T extends string | number>(options: OptionValue<T>[], value: T | null) => {
    return options.find((opt) => opt.value === value)?.label || '-';
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className={themeClass(
          'text-xl font-black flex items-center gap-2 dark:text-slate-100',
          'text-lg font-semibold text-gray-900 dark:text-slate-100'
        )}>
          {themeClass(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <title>Tennis Racket Icon</title>
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="black"/>
              <path d="M14.5 13.5L11 17L7.5 13.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7V13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>,
            null
          )}
          테니스 프로필
        </h2>
        {!isEditing && hasProfile && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={themeClass(
              'text-sm font-bold underline decoration-2 underline-offset-2 hover:text-blue-600 dark:text-slate-200',
              'text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
            )}
          >
            수정
          </button>
        )}
      </div>

      <div className={themeClass(
        'bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-5 relative overflow-hidden',
        'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-5'
      )}>
        {/* Decorative background for Neo-Brutalism */}
        <div className={themeClass(
          'absolute top-0 right-0 w-24 h-24 bg-[#a3e635] rounded-bl-full -mr-4 -mt-4 opacity-50 z-0 pointer-events-none',
          'hidden'
        )} />

        {!isEditing ? (
          hasProfile ? (
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2 items-center">
                {profile.career_years !== null && (
                  <span className={themeClass(
                    'inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded-full',
                    'inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm font-medium rounded-full'
                  )}>
                    구력 {getLabel(CAREER_YEARS_OPTIONS, profile.career_years)}
                  </span>
                )}
                {profile.ntrp_rating !== null && (
                  <span className={themeClass(
                    'inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded-full',
                    'inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm font-medium rounded-full'
                  )}>
                    NTRP {profile.ntrp_rating}
                  </span>
                )}
                {profile.skill_level && (
                  <span className={themeClass(
                    'inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded-full',
                    'inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm font-medium rounded-full'
                  )}>
                    {getLabel(SKILL_LEVEL_OPTIONS, profile.skill_level)}
                  </span>
                )}
                {profile.preferred_hand && (
                  <span className={themeClass(
                    'inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded-full',
                    'inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm font-medium rounded-full'
                  )}>
                    {getLabel(PREFERRED_HAND_OPTIONS, profile.preferred_hand)}
                  </span>
                )}
                {profile.age_group && (
                  <span className={themeClass(
                    'inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded-full',
                    'inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm font-medium rounded-full'
                  )}>
                    {getLabel(AGE_GROUP_OPTIONS, profile.age_group)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 relative z-10">
              <svg className={themeClass('w-20 h-20 mx-auto mb-3', 'w-16 h-16 mx-auto mb-3')} viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
                  {/* head */}
                  <circle cx="40" cy="26" r="12" className={themeClass('fill-[#a3e635] stroke-black stroke-[2.5]', 'fill-green-200 stroke-green-400 stroke-[1.5]')} />
                  {/* body */}
                  <path d="M24 62c0-8.8 7.2-16 16-16s16 7.2 16 16" className={themeClass('fill-[#a3e635]/50 stroke-black stroke-[2.5]', 'fill-green-100 stroke-green-400 stroke-[1.5]')} />
                  {/* racket */}
                  <ellipse cx="62" cy="30" rx="7" ry="10" className={themeClass('fill-none stroke-black stroke-[2]', 'fill-none stroke-green-400 stroke-[1.5]')} transform="rotate(-30 62 30)" />
                  <line x1="56" y1="38" x2="50" y2="50" className={themeClass('stroke-black stroke-[2]', 'stroke-green-400 stroke-[1.5]')} strokeLinecap="round" />
                </g>
                <circle cx="14" cy="16" r="2" className={themeClass('fill-black dark:fill-slate-300', 'fill-green-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
                <circle cx="70" cy="62" r="2.5" className={themeClass('fill-black dark:fill-slate-300', 'fill-green-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
                <path d="M68 12 Q68 16 72 16 Q68 16 68 20 Q68 16 64 16 Q68 16 68 12 Z" className={themeClass('fill-black dark:fill-slate-300', 'fill-green-300')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.4s' }} />
              </svg>
              <p className={themeClass('font-bold mb-3 dark:text-slate-100', 'text-gray-600 dark:text-slate-300 mb-3')}>
                아직 프로필 정보가 없습니다.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={themeClass(
                  'px-4 py-2 bg-[#a3e635] border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all',
                  'px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors'
                )}
              >
                테니스 프로필 설정하기
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4 relative z-10">
            {/* 구력 */}
            <div>
              <label htmlFor="career_years" className={themeClass('block font-bold mb-1 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1')}>
                구력
              </label>
              <select
                id="career_years"
                value={formData.career_years ?? ''}
                onChange={(e) => setFormData({ ...formData, career_years: e.target.value ? Number(e.target.value) : null })}
                className={themeClass(
                  'w-full p-2 border-2 border-black dark:border-slate-700 rounded-[5px] font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all bg-white dark:bg-slate-900 dark:text-slate-100',
                  'w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
                )}
              >
                <option value="">선택해주세요</option>
                {CAREER_YEARS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* NTRP */}
            <div>
              <label htmlFor="ntrp_rating" className={themeClass('block font-bold mb-1 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1')}>
                NTRP (1.0 ~ 7.0)
              </label>
              <input
                id="ntrp_rating"
                type="number"
                min="1.0"
                max="7.0"
                step="0.5"
                placeholder="1.0 ~ 7.0"
                value={formData.ntrp_rating ?? ''}
                onChange={(e) => setFormData({ ...formData, ntrp_rating: e.target.value ? Number(e.target.value) : null })}
                className={themeClass(
                  'w-full p-2 border-2 border-black dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-[5px] font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
                  'w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
                )}
              />
            </div>

            {/* 실력 수준 */}
            <div>
              <span className={themeClass('block font-bold mb-2 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2')}>
                실력 수준
              </span>
              <div className="flex flex-wrap gap-2">
                {SKILL_LEVEL_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, skill_level: opt.value })}
                    className={cn(
                      themeClass(
                        'px-3 py-1 border-2 border-black dark:border-slate-700 rounded-full text-sm font-bold transition-all',
                        'px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-full text-sm transition-colors'
                      ),
                      formData.skill_level === opt.value
                        ? themeClass('bg-black text-white', 'bg-green-600 text-white border-green-600')
                        : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 주 사용 손 */}
            <div>
              <span className={themeClass('block font-bold mb-2 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2')}>
                주 사용 손
              </span>
              <div className="flex flex-wrap gap-2">
                {PREFERRED_HAND_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, preferred_hand: opt.value })}
                    className={cn(
                      themeClass(
                        'px-3 py-1 border-2 border-black dark:border-slate-700 rounded-full text-sm font-bold transition-all',
                        'px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-full text-sm transition-colors'
                      ),
                      formData.preferred_hand === opt.value
                        ? themeClass('bg-black text-white', 'bg-green-600 text-white border-green-600')
                        : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 연령대 */}
            <div>
              <span className={themeClass('block font-bold mb-2 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2')}>
                연령대
              </span>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUP_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, age_group: opt.value })}
                    className={cn(
                      themeClass(
                        'px-3 py-1 border-2 border-black dark:border-slate-700 rounded-full text-sm font-bold transition-all',
                        'px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-full text-sm transition-colors'
                      ),
                      formData.age_group === opt.value
                        ? themeClass('bg-black text-white', 'bg-green-600 text-white border-green-600')
                        : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6 pt-2 border-t border-gray-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={themeClass(
                  'flex-1 py-2 bg-[#a3e635] border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50',
                  'flex-1 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50'
                )}
              >
                {isSaving ? <Spinner className="inline w-4 h-4" /> : '저장'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className={themeClass(
                  'flex-1 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black dark:border-slate-700 font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#f1f3f8] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#f1f3f8] transition-all disabled:opacity-50',
                  'flex-1 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50'
                )}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
