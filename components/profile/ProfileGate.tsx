'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useTennisProfile } from '@/lib/hooks/useTennisProfile';
import { isProfileComplete, validateNickname, NICKNAME_MAX } from '@/lib/constants/profile';
import { NTRP_OPTIONS } from '@/lib/constants/tennis';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/ui/Spinner';

type GateFeature = 'matching' | 'ladder' | 'transfers';

const FEATURE_GUIDE: Record<GateFeature, { href: string; label: string }> = {
  matching: { href: '/guide/matching', label: '매칭 기능 미리보기' },
  ladder: { href: '/guide/ladder', label: '래더 시스템 미리보기' },
  transfers: { href: '/guide/transfers', label: '양도 마켓 미리보기' },
};

const FEATURE_CONFIG = {
  matching: { color: 'blue', bgClass: 'bg-blue-50', minimalBg: 'bg-blue-50', minimalColor: 'blue', label: '매칭', description: '같이 테니스 칠 파트너를 찾아보세요' },
  ladder: { color: 'purple', bgClass: 'bg-purple-50', minimalBg: 'bg-purple-50', minimalColor: 'purple', label: '래더', description: 'ELO 랭킹으로 실력을 증명하세요' },
  transfers: { color: 'orange', bgClass: 'bg-orange-50', minimalBg: 'bg-orange-50', minimalColor: 'orange', label: '양도 마켓', description: '코트 예약을 양도하거나 구해보세요' },
};

interface ProfileGateProps {
  children: ReactNode;
  feature?: GateFeature;
}

export default function ProfileGate({ children, feature }: ProfileGateProps) {
  const themeClass = useThemeClass();
  const { user, loading: authLoading } = useAuth();
  const { profile: userProfile, isLoading: userLoading, updateProfile: updateUserProfile, mutate: mutateUser } = useUserProfile();
  const { profile: tennisProfile, isLoading: tennisLoading, updateProfile: updateTennisProfile, mutate: mutateTennis } = useTennisProfile();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<{
    nickname: string;
    ntrp_rating: number | null;
  }>({
    nickname: '',
    ntrp_rating: null,
  });
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile || tennisProfile) {
      setFormData({
        nickname: userProfile?.nickname || '',
        ntrp_rating: tennisProfile?.ntrp_rating ?? null,
      });
    }
  }, [userProfile, tennisProfile]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, nickname: value }));
    const error = validateNickname(value);
    setNicknameError(error);
  };

  const handleSave = async () => {
    const missingNickname = !userProfile?.nickname;
    const missingNtrp = tennisProfile?.ntrp_rating === null || tennisProfile?.ntrp_rating === undefined;

    if (missingNickname) {
      const error = validateNickname(formData.nickname);
      if (error) {
        setNicknameError(error);
        return;
      }
    }

    try {
      setIsSaving(true);
      const promises = [];
      if (missingNickname) {
        promises.push(updateUserProfile({ nickname: formData.nickname }));
      }
      if (missingNtrp && formData.ntrp_rating !== null) {
        promises.push(updateTennisProfile({ ntrp_rating: formData.ntrp_rating }));
      }
      
      await Promise.all(promises);
      
      await Promise.all([mutateUser(), mutateTennis()]);
      
      showToast('프로필이 설정되었습니다', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : '저장 중 오류가 발생했습니다';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || userLoading || tennisLoading) {
    return (
      <div className="py-12 text-center">
        <Spinner className="inline" />
      </div>
    );
  }

  const f = feature || 'matching';
  const config = FEATURE_CONFIG[f];
  const guide = FEATURE_GUIDE[f];

  const getFeatureSVG = () => {
    if (f === 'matching') {
      return (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            <circle cx="20" cy="24" r="8" className={themeClass('stroke-black stroke-[2.5]', 'stroke-blue-400 stroke-[1.5]')} fill="none" />
            <path d="M8 50c0-6.6 5.4-12 12-12s12 5.4 12 12" className={themeClass('stroke-black stroke-[2.5]', 'stroke-blue-400 stroke-[1.5]')} fill="none" strokeLinecap="round" />
            
            <circle cx="44" cy="24" r="8" className={themeClass('stroke-black stroke-[2.5]', 'stroke-blue-400 stroke-[1.5]')} fill="none" />
            <path d="M32 50c0-6.6 5.4-12 12-12s12 5.4 12 12" className={themeClass('stroke-black stroke-[2.5]', 'stroke-blue-400 stroke-[1.5]')} fill="none" strokeLinecap="round" />
            
            <path d="M26 36h12" className={themeClass('stroke-black stroke-[2.5]', 'stroke-blue-500 stroke-[2]')} strokeLinecap="round" strokeDasharray="4 4" />
          </g>
          <circle cx="10" cy="14" r="2" className={themeClass('fill-black', 'fill-blue-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
          <circle cx="54" cy="18" r="2.5" className={themeClass('fill-black', 'fill-blue-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
        </svg>
      );
    }
    if (f === 'ladder') {
      return (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            <path d="M16 16h32v12c0 8.8-7.2 16-16 16s-16-7.2-16-16V16z" className={themeClass('fill-[#c084fc] stroke-black stroke-[2.5]', 'fill-purple-100 stroke-purple-400 stroke-[1.5]')} />
            <path d="M16 20H8v6c0 4.4 3.6 8 8 8h2" className={themeClass('stroke-black stroke-[2.5]', 'stroke-purple-400 stroke-[1.5]')} fill="none" strokeLinecap="round" />
            <path d="M48 20h8v6c0 4.4-3.6 8-8 8h-2" className={themeClass('stroke-black stroke-[2.5]', 'stroke-purple-400 stroke-[1.5]')} fill="none" strokeLinecap="round" />
            <path d="M32 44v10" className={themeClass('stroke-black stroke-[2.5]', 'stroke-purple-400 stroke-[1.5]')} strokeLinecap="round" />
            <path d="M20 54h24" className={themeClass('stroke-black stroke-[2.5]', 'stroke-purple-400 stroke-[1.5]')} strokeLinecap="round" />
            <rect x="26" y="24" width="4" height="12" className={themeClass('fill-black', 'fill-purple-500')} />
            <rect x="34" y="20" width="4" height="16" className={themeClass('fill-black', 'fill-purple-500')} />
          </g>
          <circle cx="14" cy="16" r="2" className={themeClass('fill-black', 'fill-purple-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
          <circle cx="50" cy="12" r="2.5" className={themeClass('fill-black', 'fill-purple-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
        </svg>
      );
    }
    return (
      <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
          <rect x="12" y="16" width="28" height="20" rx="2" className={themeClass('fill-[#fb923c] stroke-black stroke-[2.5]', 'fill-orange-100 stroke-orange-400 stroke-[1.5]')} />
          <rect x="24" y="28" width="28" height="20" rx="2" className={themeClass('fill-white stroke-black stroke-[2.5]', 'fill-white stroke-orange-500 stroke-[1.5]')} />
          <path d="M32 42l4 4 4-4" className={themeClass('stroke-black stroke-[2]', 'stroke-orange-500 stroke-[1.5]')} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M36 34v12" className={themeClass('stroke-black stroke-[2]', 'stroke-orange-500 stroke-[1.5]')} strokeLinecap="round" />
          <path d="M24 22l-4-4-4 4" className={themeClass('stroke-black stroke-[2]', 'stroke-orange-400 stroke-[1.5]')} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 18v12" className={themeClass('stroke-black stroke-[2]', 'stroke-orange-400 stroke-[1.5]')} strokeLinecap="round" />
        </g>
        <circle cx="10" cy="30" r="2" className={themeClass('fill-black', 'fill-orange-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
        <circle cx="54" cy="20" r="2.5" className={themeClass('fill-black', 'fill-orange-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
      </svg>
    );
  };

  if (!user) {
    return (
      <div className={cn(
        'mx-4 my-8 p-6 text-center',
        themeClass(
          `border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] ${config.bgClass}`,
          `border border-${config.minimalColor}-200 rounded-xl shadow-sm ${config.minimalBg}`
        )
      )}>
        {getFeatureSVG()}
        <p className={themeClass('font-black text-lg mb-2', `text-${config.minimalColor}-900 font-bold text-lg mb-2`)}>
          {config.label} 기능을 이용하려면 로그인이 필요합니다
        </p>
        <p className={themeClass('text-black/80 font-medium mb-6', `text-${config.minimalColor}-700 mb-6`)}>
          {config.description}
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            className={themeClass(
              'inline-block px-6 py-2.5 bg-white border-2 border-black font-bold shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all',
              `inline-block px-6 py-2.5 bg-${config.minimalColor}-600 text-white rounded-lg font-medium hover:bg-${config.minimalColor}-700 transition-colors`
            )}
          >
            로그인하기
          </Link>
          {guide && (
            <Link
              href={guide.href}
              className={themeClass(
                'text-sm text-black/60 font-bold hover:text-black transition-colors underline underline-offset-2',
                `text-sm text-${config.minimalColor}-600 hover:text-${config.minimalColor}-800 transition-colors underline underline-offset-2`
              )}
            >
              사용법 보기 →
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!isProfileComplete(userProfile, tennisProfile?.ntrp_rating ?? null)) {
    const missingNickname = !userProfile?.nickname;
    const missingNtrp = tennisProfile?.ntrp_rating === null || tennisProfile?.ntrp_rating === undefined;

    return (
      <div className={cn(
        'mx-4 my-8 p-6',
        themeClass(
          `border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] ${config.bgClass}`,
          `border border-${config.minimalColor}-200 rounded-xl shadow-sm ${config.minimalBg}`
        )
      )}>
        <div className="text-center mb-6">
          <p className={themeClass('font-black text-lg mb-2', `text-${config.minimalColor}-900 font-bold text-lg mb-2`)}>
            {config.label} 기능을 사용하려면 프로필을 완성해주세요
          </p>
          <div className="flex justify-center gap-4 text-sm mt-3">
            <span className={themeClass(
              cn('font-bold flex items-center gap-1', !missingNickname ? 'text-black opacity-50 line-through' : 'text-black'),
              cn('flex items-center gap-1', !missingNickname ? 'text-gray-400 line-through' : `text-${config.minimalColor}-700 font-medium`)
            )}>
              {!missingNickname ? '☑' : '☐'} 닉네임 설정
            </span>
            <span className={themeClass(
              cn('font-bold flex items-center gap-1', !missingNtrp ? 'text-black opacity-50 line-through' : 'text-black'),
              cn('flex items-center gap-1', !missingNtrp ? 'text-gray-400 line-through' : `text-${config.minimalColor}-700 font-medium`)
            )}>
              {!missingNtrp ? '☑' : '☐'} NTRP 설정
            </span>
          </div>
        </div>

        <div className={themeClass(
          'bg-white border-2 border-black rounded-[5px] p-5 mb-4 shadow-[2px_2px_0px_0px_#000]',
          'bg-white rounded-lg p-5 mb-4 shadow-sm border border-gray-100'
        )}>
          <div className="space-y-4">
            {missingNickname && (
              <div>
                <label htmlFor="nickname" className={themeClass('block font-bold mb-1 text-sm', 'block text-sm font-medium text-gray-700 mb-1')}>
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
                    'w-full p-2 border-2 border-black rounded-[5px] font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all',
                    `w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-${config.minimalColor}-500 focus:border-transparent outline-none`
                  )}
                />
                <div className="flex justify-between mt-1">
                  <span className={themeClass(
                    cn('text-xs font-bold', nicknameError ? 'text-red-500' : 'text-gray-500'),
                    cn('text-xs', nicknameError ? 'text-red-500' : 'text-gray-500')
                  )}>
                    {nicknameError || '닉네임은 2~10자로 입력해주세요'}
                  </span>
                  <span className={themeClass('text-xs font-bold text-gray-500', 'text-xs text-gray-500')}>
                    {formData.nickname.length}/{NICKNAME_MAX}
                  </span>
                </div>
              </div>
            )}

            {missingNtrp && (
              <div>
                <span className={themeClass('block font-bold mb-2 text-sm', 'block text-sm font-medium text-gray-700 mb-2')}>
                  NTRP
                </span>
                <div className="space-y-2">
                  {NTRP_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, ntrp_rating: opt.value })}
                      className={cn(
                        themeClass(
                          'w-full text-left p-3 border-2 border-black rounded-[5px] transition-all',
                          `w-full text-left p-3 border rounded-lg transition-colors ${
                            formData.ntrp_rating === opt.value
                              ? `bg-${config.minimalColor}-50 border-${config.minimalColor}-500`
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`
                        ),
                        formData.ntrp_rating === opt.value
                          ? themeClass('bg-[#a3e635] shadow-[2px_2px_0px_0px_#000]', '')
                          : themeClass('bg-white hover:bg-gray-50', '')
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={themeClass('font-black text-sm', 'font-bold text-sm text-gray-900')}>
                          {opt.value}
                        </span>
                        <span className={themeClass('font-bold text-sm', 'font-medium text-sm text-gray-700')}>
                          {opt.label}
                        </span>
                      </div>
                      <p className={themeClass('text-xs text-black/60 mt-0.5', 'text-xs text-gray-500 mt-0.5')}>
                        {opt.description}
                      </p>
                    </button>
                  ))}
                </div>
                <p className={themeClass('text-xs text-black/50 mt-2', 'text-xs text-gray-400 mt-2')}>
                  나중에 언제든지 변경할 수 있어요
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (missingNickname && (!!nicknameError || !formData.nickname)) || (missingNtrp && formData.ntrp_rating === null)}
              className={themeClass(
                'w-full py-2 bg-black text-white border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 mt-2',
                `w-full py-2 bg-${config.minimalColor}-600 text-white rounded-md text-sm font-medium hover:bg-${config.minimalColor}-700 transition-colors disabled:opacity-50 mt-2`
              )}
            >
              {isSaving ? <Spinner className="inline w-4 h-4" /> : '설정 완료'}
            </button>
          </div>
        </div>
        
        {guide && (
          <div className="text-center">
            <Link
              href={guide.href}
              className={themeClass(
                'text-sm text-black/60 font-bold hover:text-black transition-colors underline underline-offset-2',
                `text-sm text-${config.minimalColor}-600 hover:text-${config.minimalColor}-800 transition-colors underline underline-offset-2`
              )}
            >
              사용법 보기 →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
