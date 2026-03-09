'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';

import LoginPrompt from '@/components/auth/LoginPrompt';
import MatchingPostForm from '@/components/matching/MatchingPostForm';
import { useRouter } from 'next/navigation';

export default function NewMatchingPage() {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const router = useRouter();

  const handleLoginClose = () => {
    router.push('/matching');
  };

  if (authLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black font-bold', 'text-gray-400')}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <LoginPrompt
          isOpen={true}
          onClose={handleLoginClose}
          message="매칭 모집글을 작성하려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen py-8', themeClass('bg-nb-bg', 'bg-gray-50'))}>
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className={cn('text-2xl mb-6', themeClass('font-black text-black uppercase', 'font-bold text-gray-900'))}>
          새 매칭 모집글 작성
        </h1>
        <MatchingPostForm />
      </div>
    </div>
  );
}
