import React from 'react';
import { ContentItem } from './types';
import { highlight } from './highlight';

const formatPenaltyText = (text: string): React.ReactNode => {
  const hasPenaltyPattern = /\d차\s*위반시\s*:/.test(text) && text.length > 200;
  if (!hasPenaltyPattern) return null;

  const CATEGORY_START = '@@CATEGORY@@';
  const CATEGORY_END = '@@/CATEGORY@@';
  const BULLET_START = '@@BULLET@@';
  const BULLET_END = '@@/BULLET@@';
  
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const categoryPattern = /(예약\s*후?\s*미방문\s*시|공공질서\s*위반\s*시[^)]*\)?|예약\s*질서\s*위반\s*시[^)]*\)?)/g;
  const violationPattern = /(\d차\s*위반시\s*:\s*[^0-9]*?(?:\d+개월\s*이용\s*제한|경고|영구\s*(?:이용\s*)?제한|영구정지))/g;

  const markedText = normalizedText
    .replace(categoryPattern, `\n\n${CATEGORY_START}$1${CATEGORY_END}`)
    .replace(violationPattern, `\n  ${BULLET_START}$1${BULLET_END}\n`)
    .replace(/영구정지\s+(?=[가-힣])/g, '영구정지\n')
    .replace(/(주의해\s*주시기\s*바랍니다\.)\s*/g, '$1\n')
    .replace(/^\s*\n+/, '');

  const lines = markedText.split('\n').filter(line => line.trim());

  const renderCategoryLine = (content: string, key: number) => (
    <div key={key} className="font-bold text-gray-800 dark:text-slate-200 mt-3 first:mt-0 border-l-2 border-amber-400 pl-2 py-0.5 bg-amber-50/50 dark:bg-amber-950/40">
      {content}
    </div>
  );

  const renderBulletLine = (content: string, key: number) => (
    <div key={key} className="flex items-start gap-2 ml-4 text-sm text-gray-700 dark:text-slate-200">
      <span className="text-amber-500 shrink-0">•</span>
      <span>{highlight(content)}</span>
    </div>
  );

  const renderDefaultLine = (content: string, key: number) => {
    const isExample = content.startsWith('예시)');
    return (
      <div key={key} className={`text-sm text-gray-700 dark:text-slate-200 ${isExample ? 'ml-6' : ''}`}>
        {highlight(content)}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        const categoryMatch = trimmed.match(new RegExp(`^${CATEGORY_START}(.+?)${CATEGORY_END}$`));
        if (categoryMatch) return renderCategoryLine(categoryMatch[1], i);
        
        const bulletMatch = trimmed.match(new RegExp(`^${BULLET_START}(.+?)${BULLET_END}$`));
        if (bulletMatch) return renderBulletLine(bulletMatch[1], i);
        
        return renderDefaultLine(trimmed, i);
      })}
    </div>
  );
};

function ContentItemComponent({ item, idx }: { item: ContentItem; idx: number }) {
  const indentClass = item.indent === 2 ? 'ml-6' : item.indent === 1 ? 'ml-3' : '';
  const itemKey = `${item.type}-${item.text}-${item.indent}-${idx}`;
  
  if (item.type === 'heading') {
    return (
      <li key={itemKey} className="mt-4 mb-2 first:mt-0 list-none" role="presentation">
        <h4 className="font-bold text-gray-800 dark:text-slate-200 text-base border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 dark:bg-blue-950/40 rounded-r m-0">
          {item.text}
        </h4>
      </li>
    );
  }
  
  if (item.type === 'warning') {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
        <span className="shrink-0 text-amber-500 font-bold">※</span>
        <span className="text-amber-800 dark:text-amber-300 text-sm">{highlight(item.text)}</span>
      </li>
    );
  }

  if (item.type === 'keyvalue' && item.key) {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
        <span className="shrink-0 text-blue-500 font-bold">•</span>
        <span className="text-gray-700 dark:text-slate-200 text-sm">
          <span className="font-semibold">{item.key}:</span> {highlight(item.text)}
        </span>
      </li>
    );
  }

  if (item.type === 'subtext') {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-0.5 ${indentClass} list-none text-gray-500 dark:text-slate-400 text-sm`}>
        <span className="shrink-0">◦</span>
        <span>{highlight(item.text)}</span>
      </li>
    );
  }

  if (item.indent >= 1) {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
        <span className="shrink-0 text-blue-500 font-bold">•</span>
        <span className="text-gray-700 dark:text-slate-200 text-sm leading-relaxed">{highlight(item.text)}</span>
      </li>
    );
  }

  const penaltyFormatted = formatPenaltyText(item.text);
  if (penaltyFormatted) {
    return (
      <li key={itemKey} className="py-1 list-none">
        {penaltyFormatted}
      </li>
    );
  }

  return (
    <li key={itemKey} className="py-1 text-gray-700 dark:text-slate-200 text-sm list-none">{highlight(item.text)}</li>
  );
}

export default React.memo(ContentItemComponent);
