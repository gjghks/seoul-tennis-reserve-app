import { renderSinglePhoneLink } from '@/lib/utils/phoneLink';

export const highlight = (text: string): React.ReactNode => {
  const splitPattern = /(\d{1,2}:\d{2}\s*[~∼－-]\s*\d{1,2}:\d{2}|[0-9,]+원|\d{1,2}월|0\d{1,2}[-)]\d{3,4}[-)]\d{4}|\d+%|\d+시간|\d+일\s*전)/g;
  
  const parts = text.split(splitPattern);
  
  return parts.map((part, i) => {
    if (!part) return null;
    const key = `${part}-${i}`;
    if (/\d{1,2}:\d{2}\s*[~∼－-]\s*\d{1,2}:\d{2}/.test(part)) {
      return <code key={key} className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded font-mono text-xs">{part}</code>;
    }
    if (/[0-9,]+원/.test(part)) {
      return <code key={key} className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded font-mono text-xs">{part}</code>;
    }
    if (/\d{1,2}월/.test(part)) {
      return <span key={key} className="font-medium text-blue-600 dark:text-blue-400">{part}</span>;
    }
    if (/0\d{1,2}[-)]\d{3,4}[-)]\d{4}/.test(part)) {
      return renderSinglePhoneLink(part, key);
    }
    if (/\d+%/.test(part)) {
      return <span key={key} className="font-semibold text-orange-600 dark:text-orange-400">{part}</span>;
    }
    if (/\d+시간/.test(part)) {
      return <span key={key} className="font-medium text-indigo-600 dark:text-indigo-400">{part}</span>;
    }
    if (/\d+일\s*전/.test(part)) {
      return <span key={key} className="font-medium text-rose-600 dark:text-rose-400">{part}</span>;
    }
    return part;
  });
};
