'use client';

import { useThemeClass, cn } from '@/lib/cn';
import Link from 'next/link';
import { MatchPost, MATCH_POST_STATUS_LABELS, MATCH_SKILL_FILTER_LABELS } from '@/lib/constants/matching';
import { MATCH_TYPE_LABELS } from '@/lib/constants/tennis';

interface MatchingPostCardProps {
  post: MatchPost;
}

export default function MatchingPostCard({ post }: MatchingPostCardProps) {
  const themeClass = useThemeClass();

  const getStatusColor = (status: MatchPost['status']) => {
    switch (status) {
      case 'open':
        return themeClass('bg-[#22c55e] text-black border-2 border-black', 'bg-green-100 text-green-700 border border-green-200');
      case 'closed':
        return themeClass('bg-[#ffc400] text-black border-2 border-black', 'bg-yellow-100 text-yellow-700 border border-yellow-200');
      case 'completed':
        return themeClass('bg-gray-300 text-black border-2 border-black', 'bg-gray-100 text-gray-700 border border-gray-200');
      case 'cancelled':
        return themeClass('bg-[#ff90e8] text-black border-2 border-black', 'bg-red-100 text-red-700 border border-red-200');
      default:
        return themeClass('bg-gray-200 text-black border-2 border-black', 'bg-gray-100 text-gray-600 border border-gray-200');
    }
  };

  const isFull = post.accepted_count >= post.max_participants;

  const dateObj = new Date(post.play_date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${dateObj.getMonth() + 1}.${dateObj.getDate()}(${days[dateObj.getDay()]})`;

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <Link href={`/matching/${post.id}`} className="block">
      <div className={cn(
        'relative overflow-hidden transition-all',
        themeClass(
          'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
          'bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-1'
        )
      )}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 text-xs font-bold rounded',
              getStatusColor(post.status)
            )}>
              {MATCH_POST_STATUS_LABELS[post.status]}
            </span>
            <span className={cn(
              'px-2 py-0.5 text-xs font-bold rounded',
              themeClass('bg-black text-white', 'bg-gray-100 text-gray-700')
            )}>
              {post.district}
            </span>
            <span className={cn(
              'px-2 py-0.5 text-xs font-bold rounded',
              themeClass('bg-[#88aaee] text-black border-2 border-black', 'bg-blue-50 text-blue-700 border border-blue-100')
            )}>
              {MATCH_TYPE_LABELS[post.match_type]}
            </span>
          </div>
          <span className={cn('text-xs', themeClass('font-bold text-black/50', 'text-gray-400'))}>
            {new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
          </span>
        </div>

        <h3 className={cn('text-lg mb-4 line-clamp-1', themeClass('font-black text-black', 'font-bold text-gray-900'))}>
          {post.title}
        </h3>

        <div className="grid grid-cols-2 gap-y-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={themeClass('text-xl', 'text-gray-400 text-lg')}>📅</span>
            <span className={cn('text-sm', themeClass('font-bold text-black', 'font-medium text-gray-700'))}>
              {formattedDate} {formatTime(post.play_time_start)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={themeClass('text-xl', 'text-gray-400 text-lg')}>🏟️</span>
            <span className={cn('text-sm line-clamp-1', themeClass('font-bold text-black', 'font-medium text-gray-700'))}>
              {post.court_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={themeClass('text-xl', 'text-gray-400 text-lg')}>👥</span>
            <span className={cn('text-sm', themeClass('font-bold text-black', 'font-medium text-gray-700'))}>
              {post.skill_level ? MATCH_SKILL_FILTER_LABELS[post.skill_level] : '실력무관'}
              {post.ntrp_min && post.ntrp_max && ` (NTRP ${post.ntrp_min}-${post.ntrp_max})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={themeClass('text-xl', 'text-gray-400 text-lg')}>💰</span>
            <span className={cn('text-sm', themeClass('font-bold text-black', 'font-medium text-gray-700'))}>
              {post.cost_per_person ? `${post.cost_per_person.toLocaleString()}원` : '무료/협의'}
            </span>
          </div>
        </div>

        <div className={cn(
          'pt-3 border-t flex justify-between items-center',
          themeClass('border-black/10', 'border-gray-100')
        )}>
          <div className="flex items-center gap-2 text-sm">
            <span className={themeClass('font-bold text-black/60', 'text-gray-500')}>{post.author_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-sm font-bold',
              isFull
                ? themeClass('text-[#ff90e8]', 'text-red-500')
                : themeClass('text-[#22c55e]', 'text-green-600')
            )}>
              {post.accepted_count} / {post.max_participants}명
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
