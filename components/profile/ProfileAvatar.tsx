'use client';

import { cn } from '@/lib/cn';
import type { Gender } from '@/lib/constants/profile';

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  gender?: Gender | null;
  size?: 'sm' | 'md' | 'lg';
  nickname?: string | null;
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
} as const;

export default function ProfileAvatar({
  avatarUrl,
  gender,
  size = 'md',
  nickname,
  className,
}: ProfileAvatarProps) {
  const sizeClass = SIZE_MAP[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nickname ? `${nickname}의 프로필` : '프로필 사진'}
        className={cn(sizeClass, 'rounded-full object-cover', className)}
      />
    );
  }

  const bgColor = gender === 'male' ? 'bg-blue-100' : gender === 'female' ? 'bg-pink-100' : 'bg-gray-100';
  const strokeColor = gender === 'male' ? '#3b82f6' : gender === 'female' ? '#ec4899' : '#9ca3af';

  return (
    <div className={cn(sizeClass, 'rounded-full flex items-center justify-center', bgColor, className)}>
      <svg viewBox="0 0 40 40" fill="none" className="w-3/5 h-3/5" aria-hidden="true">
        <circle cx="20" cy="14" r="7" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M8 36c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {gender === 'female' && (
          <path d="M20 21v4M17 23h6" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
