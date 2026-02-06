'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { FacilityTag } from '@/lib/utils/facilityTags';

interface FacilityTagsProps {
  tags: FacilityTag[];
  maxTags?: number;
  className?: string;
}

export default function FacilityTags({ tags, maxTags, className }: FacilityTagsProps) {
  const { isNeoBrutalism } = useTheme();

  const visibleTags = typeof maxTags === 'number' ? tags.slice(0, maxTags) : tags;
  if (visibleTags.length === 0) return null;

  return (
    <div className={cn('flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5', className)}>
      {visibleTags.map((tag) => (
        <span
          key={tag.key}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 text-xs whitespace-nowrap',
            isNeoBrutalism
              ? `border-2 border-black rounded-[5px] font-black text-black ${tag.color}`
              : 'rounded-full font-semibold text-gray-700 bg-gray-100 border border-gray-200'
          )}
        >
          <span aria-hidden="true">{tag.icon}</span>
          <span>{tag.label}</span>
        </span>
      ))}
    </div>
  );
}
