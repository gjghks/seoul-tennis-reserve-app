'use client';

import { useEffect, useState } from 'react';
import { useThemeClass } from '@/lib/cn';

interface VisitCounts {
  today: number;
  total: number;
}

const SESSION_KEY = 'seoul-tennis-visited';

function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}

export default function VisitorCounter() {
  const themeClass = useThemeClass();
  const [counts, setCounts] = useState<VisitCounts | null>(null);

  useEffect(() => {
    const alreadyVisited = sessionStorage.getItem(SESSION_KEY);

    if (alreadyVisited) {
      fetch('/api/visit')
        .then(res => res.json())
        .then((data: VisitCounts) => setCounts(data))
        .catch(() => {});
      return;
    }

    fetch('/api/visit', { method: 'POST' })
      .then(res => res.json())
      .then((data: VisitCounts) => {
        setCounts(data);
        sessionStorage.setItem(SESSION_KEY, '1');
      })
      .catch(() => {});
  }, []);

  if (!counts) return null;

  return (
    <div className={`flex items-center justify-center gap-3 text-[clamp(10px,2.5vw,12px)] ${themeClass('text-white/40', 'text-gray-300')}`}>
      <span>오늘 <strong className={themeClass('text-white/60', 'text-gray-400')}>{formatNumber(counts.today)}</strong></span>
      <span className={themeClass('text-white/20', 'text-gray-200')}>·</span>
      <span>전체 <strong className={themeClass('text-white/60', 'text-gray-400')}>{formatNumber(counts.total)}</strong></span>
    </div>
  );
}
