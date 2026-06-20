'use client';

import { useState, useEffect } from 'react';
import { useThemeClass, cn } from '@/lib/cn';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/ui/Spinner';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import type { Gender } from '@/lib/constants/profile';
import {
  GENDER_OPTIONS,
  NICKNAME_MAX,
  BIO_MAX,
  validateNickname,
} from '@/lib/constants/profile';

export default function UserProfileSection() {
  const themeClass = useThemeClass();
  const { profile, isLoading, updateProfile } = useUserProfile();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{ nickname: string; bio: string; gender: Gender | null }>({
    nickname: '',
    bio: '',
    gender: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || '',
        bio: profile.bio || '',
        gender: profile.gender || null,
      });
    }
  }, [profile]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, nickname: value }));
    const error = validateNickname(value);
    setNicknameError(error);
  };

  const handleSave = async () => {
    const error = validateNickname(formData.nickname);
    if (error) {
      setNicknameError(error);
      return;
    }

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
        nickname: profile.nickname || '',
        bio: profile.bio || '',
        gender: profile.gender || null,
      });
    } else {
      setFormData({
        nickname: '',
        bio: '',
        gender: null,
      });
    }
    setNicknameError(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Spinner className="inline" />
      </div>
    );
  }

  const hasProfile = Boolean(profile?.nickname);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className={themeClass(
          'text-xl font-black flex items-center gap-2 dark:text-slate-100',
          'text-lg font-semibold text-gray-900 dark:text-slate-100'
        )}>
          {themeClass(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <title>Person Icon</title>
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="black"/>
            </svg>,
            null
          )}
          기본 프로필
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
        'bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-5 relative overflow-hidden',
        'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-5'
      )}>
        <div className={themeClass(
          'absolute top-0 right-0 w-24 h-24 bg-[#88aaee] rounded-bl-full -mr-4 -mt-4 opacity-50 z-0 pointer-events-none',
          'hidden'
        )} />

        {!isEditing ? (
          hasProfile ? (
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <ProfileAvatar 
                avatarUrl={profile?.avatar_url || null}
                size="lg"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className={themeClass('text-xl font-black dark:text-slate-100', 'text-xl font-bold text-gray-900 dark:text-slate-100')}>
                    {profile?.nickname || '닉네임 미설정'}
                  </h3>
                  {profile?.gender && (
                    <span className={themeClass(
                      'inline-block px-2 py-0.5 bg-black text-white text-xs font-bold rounded-full',
                      'inline-block px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-medium rounded-full'
                    )}>
                      {GENDER_OPTIONS.find((g) => g.value === profile.gender)?.label}
                    </span>
                  )}
                </div>
                <p className={themeClass(
                  'text-black/80 dark:text-slate-200 font-medium',
                  'text-gray-600 dark:text-slate-300'
                )}>
                  {profile?.bio || '한줄 소개가 없습니다'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 relative z-10">
              <svg className={themeClass('w-20 h-20 mx-auto mb-3', 'w-16 h-16 mx-auto mb-3')} viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
                  <circle cx="40" cy="26" r="12" className={themeClass('fill-[#88aaee] stroke-black stroke-[2.5]', 'fill-green-200 stroke-green-400 stroke-[1.5]')} />
                  <path d="M24 62c0-8.8 7.2-16 16-16s16 7.2 16 16" className={themeClass('fill-[#88aaee]/50 stroke-black stroke-[2.5]', 'fill-green-100 stroke-green-400 stroke-[1.5]')} />
                </g>
                <circle cx="14" cy="16" r="2" className={themeClass('fill-black dark:fill-slate-300', 'fill-green-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
                <circle cx="70" cy="62" r="2.5" className={themeClass('fill-black dark:fill-slate-300', 'fill-green-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
              </svg>
              <p className={themeClass('font-bold mb-3 dark:text-slate-100', 'text-gray-600 dark:text-slate-300 mb-3')}>
                아직 프로필 정보가 없습니다.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={themeClass(
                  'px-4 py-2 bg-[#88aaee] border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all',
                  'px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors'
                )}
              >
                프로필 설정하기
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4 relative z-10">
            <div>
              <label htmlFor="nickname" className={themeClass('block font-bold mb-1 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1')}>
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임을 입력해주세요"
                maxLength={NICKNAME_MAX}
                className={themeClass(
                  'w-full p-2 border-2 border-black dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-[5px] font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all',
                  'w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
                )}
              />
              <div className="flex justify-between mt-1">
                <span className={themeClass(
                  cn('text-xs font-bold', nicknameError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'),
                  cn('text-xs', nicknameError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-slate-400')
                )}>
                  {nicknameError || '닉네임은 2~10자로 입력해주세요'}
                </span>
                <span className={themeClass('text-xs font-bold text-gray-500 dark:text-slate-400', 'text-xs text-gray-500 dark:text-slate-400')}>
                  {formData.nickname.length}/{NICKNAME_MAX}
                </span>
              </div>
            </div>

            <div>
              <span className={themeClass('block font-bold mb-2 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2')}>
                성별
              </span>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, gender: opt.value })}
                    className={cn(
                      themeClass(
                        'px-3 py-1 border-2 border-black dark:border-slate-700 rounded-full text-sm font-bold transition-all',
                        'px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-full text-sm transition-colors'
                      ),
                      formData.gender === opt.value
                        ? themeClass('bg-black text-white', 'bg-green-600 text-white border-green-600')
                        : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="bio" className={themeClass('block font-bold mb-1 text-sm dark:text-slate-100', 'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1')}>
                한줄 소개
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="자신을 소개해보세요 (최대 50자)"
                maxLength={BIO_MAX}
                rows={2}
                className={themeClass(
                  'w-full p-2 border-2 border-black dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-[5px] font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all resize-none',
                  'w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none'
                )}
              />
              <div className="flex justify-end mt-1">
                <span className={themeClass('text-xs font-bold text-gray-500 dark:text-slate-400', 'text-xs text-gray-500 dark:text-slate-400')}>
                  {formData.bio.length}/{BIO_MAX}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-2 border-t border-gray-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !!nicknameError || !formData.nickname}
                className={themeClass(
                  'flex-1 py-2 bg-[#88aaee] border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50',
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
                  'flex-1 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black dark:border-slate-700 font-bold shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50',
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
