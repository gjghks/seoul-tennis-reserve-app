'use client';

import { useMemo } from 'react';
import { ContentItem, FeeInfo, InfoCard } from './types';
import { getSanitizedHtml, isHtmlRenderingReliable, parseContent } from '@/lib/utils/contentParser';
import { renderSinglePhoneLink } from '@/lib/utils/phoneLink';

const sectionStyles: Record<string, { emoji: string; color: string }> = {
  '개강': { emoji: '📅', color: 'teal' },
  '회원접수': { emoji: '📝', color: 'blue' },
  '등록': { emoji: '📝', color: 'blue' },
  '접수': { emoji: '📝', color: 'blue' },
  '코트사용': { emoji: '🎾', color: 'emerald' },
  '코트대관': { emoji: '💳', color: 'rose' },
  '코트': { emoji: '🎾', color: 'emerald' },
  '환불': { emoji: '💳', color: 'rose' },
  '취소': { emoji: '💳', color: 'rose' },
  '유의': { emoji: '⚠️', color: 'amber' },
  '주의': { emoji: '⚠️', color: 'amber' },
  '금지': { emoji: '🚫', color: 'red' },
  '제한': { emoji: '🚫', color: 'red' },
  '불이익': { emoji: '⚠️', color: 'amber' },
  '패널티': { emoji: '⚠️', color: 'amber' },
  '이용요금': { emoji: '💰', color: 'green' },
  '이용료': { emoji: '💰', color: 'green' },
  '운영': { emoji: '🕐', color: 'indigo' },
  '시설': { emoji: '🏟️', color: 'sky' },
  '문의': { emoji: '📞', color: 'pink' },
  '예약': { emoji: '📅', color: 'teal' },
  '이용시간': { emoji: '🕐', color: 'indigo' },
  '시간': { emoji: '🕐', color: 'indigo' },
  '주차': { emoji: '🅿️', color: 'blue' },
  '안내': { emoji: '📋', color: 'gray' },
  '이용': { emoji: '🎾', color: 'emerald' },
  '영리': { emoji: '🚫', color: 'red' },
  '편법': { emoji: '🚫', color: 'red' },
  '양도': { emoji: '🚫', color: 'red' },
  '공지': { emoji: '📢', color: 'blue' },
  '대관': { emoji: '📋', color: 'teal' },
  '기타': { emoji: '📌', color: 'gray' },
  '향후': { emoji: '📅', color: 'teal' },
  '이용수칙': { emoji: '📖', color: 'indigo' },
  '할인': { emoji: '💸', color: 'green' },
  '사용료': { emoji: '💰', color: 'green' },
};

const colorClasses: Record<string, { bg: string; border: string; title: string; headerBg: string }> = {
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', title: 'text-teal-700', headerBg: 'bg-teal-100/50' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-700', headerBg: 'bg-blue-100/50' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-700', headerBg: 'bg-emerald-100/50' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-700', headerBg: 'bg-rose-100/50' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700', headerBg: 'bg-amber-100/50' },
  green: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-700', headerBg: 'bg-green-100/50' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', title: 'text-indigo-700', headerBg: 'bg-indigo-100/50' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', title: 'text-sky-700', headerBg: 'bg-sky-100/50' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', title: 'text-pink-700', headerBg: 'bg-pink-100/50' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-700', headerBg: 'bg-gray-100/50' },
};

const getStyle = (title: string) => {
  for (const [key, style] of Object.entries(sectionStyles)) {
    if (title.includes(key)) return style;
  }
  return { emoji: '📋', color: 'gray' };
};

const highlight = (text: string): React.ReactNode => {
  const splitPattern = /(\d{1,2}:\d{2}\s*[~∼－-]\s*\d{1,2}:\d{2}|[0-9,]+원|\d{1,2}월|0\d{1,2}[-)]\d{3,4}[-)]\d{4}|\d+%|\d+시간|\d+일\s*전)/g;
  
  const parts = text.split(splitPattern);
  
  return parts.map((part, i) => {
    if (!part) return null;
    const key = `${part}-${i}`;
    if (/\d{1,2}:\d{2}\s*[~∼－-]\s*\d{1,2}:\d{2}/.test(part)) {
      return <code key={key} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono text-xs">{part}</code>;
    }
    if (/[0-9,]+원/.test(part)) {
      return <code key={key} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-mono text-xs">{part}</code>;
    }
    if (/\d{1,2}월/.test(part)) {
      return <span key={key} className="font-medium text-blue-600">{part}</span>;
    }
    if (/0\d{1,2}[-)]\d{3,4}[-)]\d{4}/.test(part)) {
      return renderSinglePhoneLink(part, key);
    }
    if (/\d+%/.test(part)) {
      return <span key={key} className="font-semibold text-orange-600">{part}</span>;
    }
    if (/\d+시간/.test(part)) {
      return <span key={key} className="font-medium text-indigo-600">{part}</span>;
    }
    if (/\d+일\s*전/.test(part)) {
      return <span key={key} className="font-medium text-rose-600">{part}</span>;
    }
    return part;
  });
};

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
    <div key={key} className="font-bold text-gray-800 mt-3 first:mt-0 border-l-2 border-amber-400 pl-2 py-0.5 bg-amber-50/50">
      {content}
    </div>
  );

  const renderBulletLine = (content: string, key: number) => (
    <div key={key} className="flex items-start gap-2 ml-4 text-sm text-gray-700">
      <span className="text-amber-500 shrink-0">•</span>
      <span>{highlight(content)}</span>
    </div>
  );

  const renderDefaultLine = (content: string, key: number) => {
    const isExample = content.startsWith('예시)');
    return (
      <div key={key} className={`text-sm text-gray-700 ${isExample ? 'ml-6' : ''}`}>
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

const renderItem = (item: ContentItem, idx: number) => {
  const indentClass = item.indent === 2 ? 'ml-6' : item.indent === 1 ? 'ml-3' : '';
  const itemKey = `${item.type}-${item.text}-${item.indent}-${idx}`;
  
  if (item.type === 'heading') {
    return (
      <li key={itemKey} className="mt-4 mb-2 first:mt-0 list-none" role="presentation">
        <h4 className="font-bold text-gray-800 text-base border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 rounded-r m-0">
          {item.text}
        </h4>
      </li>
    );
  }
  
  if (item.type === 'warning') {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
        <span className="shrink-0 text-amber-500 font-bold">※</span>
        <span className="text-amber-800 text-sm">{highlight(item.text)}</span>
      </li>
    );
  }

  if (item.type === 'keyvalue' && item.key) {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
        <span className="shrink-0 text-blue-500 font-bold">•</span>
        <span className="text-gray-700 text-sm">
          <span className="font-semibold">{item.key}:</span> {highlight(item.text)}
        </span>
      </li>
    );
  }

  if (item.type === 'subtext') {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-0.5 ${indentClass} list-none text-gray-500 text-sm`}>
        <span className="shrink-0">◦</span>
        <span>{highlight(item.text)}</span>
      </li>
    );
  }

  if (item.indent >= 1) {
    return (
      <li key={itemKey} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
        <span className="shrink-0 text-blue-500 font-bold">•</span>
        <span className="text-gray-700 text-sm leading-relaxed">{highlight(item.text)}</span>
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
    <li key={itemKey} className="py-1 text-gray-700 text-sm list-none">{highlight(item.text)}</li>
  );
};

const renderTable = (rows: string[][]) => {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);
  
  const isWideTable = header.length > 6;
  const isMonthlyTable = header.some(h => /^\d{1,2}월$/.test(h));
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200 shadow-sm">
      <table className={`text-sm border-collapse ${isWideTable ? 'w-max min-w-full' : 'w-full'}`}>
        <thead>
          <tr className="bg-gray-100">
            {header.map((cell, i) => {
              const monthMatch = cell.match(/^(\d{1,2})월$/);
              const isCurrentMonth = monthMatch && parseInt(monthMatch[1]) === currentMonth;
              const headerKey = `${cell}-${i}`;
              return (
                <th 
                  key={headerKey} 
                  className={`${isWideTable ? 'px-2 py-2' : 'px-3 py-2.5'} text-center font-bold border border-gray-200 whitespace-nowrap ${
                    i === 0 
                      ? 'bg-gray-200 sticky left-0 z-10' 
                      : isCurrentMonth 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {cell}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIdx) => {
            const rowKey = `${row.join('|')}-${rowIdx}`;
            return (
              <tr key={rowKey} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIdx) => {
                  const monthMatch = header[cellIdx]?.match(/^(\d{1,2})월$/);
                  const isCurrentMonth = monthMatch && parseInt(monthMatch[1]) === currentMonth;
                  const isEmpty = cell === '-' || cell === '' || cell === '~';
                  const cellKey = `${cell}-${cellIdx}`;
                  
                  return (
                    <td 
                      key={cellKey} 
                    className={`${isWideTable ? 'px-2 py-1.5' : 'px-3 py-2'} border border-gray-200 text-center whitespace-nowrap ${
                      cellIdx === 0 
                        ? 'font-semibold text-gray-700 bg-gray-100 sticky left-0 z-10' 
                        : isCurrentMonth
                          ? isEmpty 
                            ? 'bg-blue-50/50 text-gray-400'
                            : 'bg-blue-50 text-blue-700 font-medium'
                          : isEmpty 
                            ? 'text-gray-300' 
                            : 'text-gray-600'
                    }`}
                  >
                    {isMonthlyTable && isEmpty ? (
                      <span className="text-gray-300">-</span>
                    ) : (
                      highlight(cell)
                    )}
                  </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const renderInfoCards = (cards: InfoCard[]) => {
  const iconMap: Record<string, string> = {
    '시설현황': '🏟️',
    '운영시간': '🕐',
    '휴관안내': '📅',
    '대관방법': '📋',
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map((card, idx) => {
        const cardKey = `${card.label}-${idx}`;
        return (
          <div key={cardKey} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{iconMap[card.label] || '📌'}</span>
              <h4 className="font-bold text-gray-800 text-sm">{card.label}</h4>
            </div>
            <ul className="space-y-1">
              {card.items.map((item, itemIdx) => {
                const itemKey = `${card.label}-${item}-${itemIdx}`;
                return (
                  <li key={itemKey} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{highlight(item)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

const renderFeeTable = (fees: FeeInfo[]) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-100 to-teal-100">
            <th className="px-4 py-3 text-left font-bold text-gray-800 border-b border-gray-200">구분</th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 border-b border-gray-200">단위</th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 border-b border-gray-200">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                평일
              </span>
            </th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 border-b border-gray-200">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                야간/주말/공휴일
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee, idx) => {
            const feeKey = `${fee.type}-${fee.unit || 'unit'}-${idx}`;
            return (
              <tr key={feeKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-100">
                  {fee.type.replace('실내 대관료', '🏠 실내').replace('실외 대관료', '🌳 실외').replace('조명료', '💡 조명')}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs border-b border-gray-100">
                  {fee.unit || '-'}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100">
                  {fee.weekday ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                      {fee.weekday.replace(/평일\s*:\s*/, '')}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100">
                  {fee.weekend ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold text-xs">
                      {fee.weekend.replace(/야간,?\s*주말,?\s*공휴일\s*:\s*/, '')}
                    </span>
                  ) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function DetailContent({ content }: { content: string }) {
  const contentWithoutHwpJson = useMemo(
    () => content.replace(/<!--\[data-hwpjson\][\s\S]*?-->/g, ''),
    [content]
  );

  const hasHtmlTags = useMemo(
    () => /<[a-z][\s\S]*>/i.test(contentWithoutHwpJson) || 
          /\bstyle\s+type=/i.test(contentWithoutHwpJson) ||
          /\/style\b/i.test(contentWithoutHwpJson),
    [contentWithoutHwpJson]
  );

  const shouldRenderAsHtml = useMemo(
    () => hasHtmlTags && isHtmlRenderingReliable(contentWithoutHwpJson),
    [hasHtmlTags, contentWithoutHwpJson]
  );

  const sanitizedHtml = useMemo(
    () => (shouldRenderAsHtml ? getSanitizedHtml(content) : ''),
    [content, shouldRenderAsHtml]
  );

  const sanitizedHtmlProps = useMemo(
    () => ({ dangerouslySetInnerHTML: { __html: sanitizedHtml } }),
    [sanitizedHtml]
  );

  const { sections, standaloneTables } = useMemo(() => parseContent(content), [content]);

  if (sections.length === 0 && !hasHtmlTags) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
          <span className="text-xl">📖</span>
          상세 안내
        </h2>
      </div>

      {shouldRenderAsHtml ? (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div 
            className="p-5 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-table:border-collapse prose-td:border prose-td:border-gray-200 prose-td:p-2 prose-th:border prose-th:border-gray-200 prose-th:p-2 prose-th:bg-gray-100"
            {...sanitizedHtmlProps}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {sections.map((section, idx) => {
              const { emoji, color } = getStyle(section.title);
              const classes = colorClasses[color] || colorClasses.gray;
              const sectionKey = `${section.title}-${idx}`;

              return (
                <div
                  key={sectionKey}
                  className={`rounded-xl border ${classes.border} ${classes.bg} overflow-hidden`}
                >
                  <div className={`px-4 py-3 ${classes.headerBg} border-b ${classes.border}`}>
                    <h3 className={`font-bold ${classes.title} flex items-center gap-2`}>
                      <span>{emoji}</span>
                      {section.title}
                    </h3>
                  </div>

                  <div className="px-4 py-3 bg-white/80">
                    {section.infoCards && section.infoCards.length > 0 && renderInfoCards(section.infoCards)}
                    {section.feeTable && section.feeTable.length > 0 && renderFeeTable(section.feeTable)}
                    {section.items.length > 0 && (
                      <ul className="space-y-0.5 list-none m-0 p-0">
                        {section.items.map((item, itemIdx) => renderItem(item, itemIdx))}
                      </ul>
                    )}
                    {section.table && section.table.length > 0 && renderTable(section.table)}
                  </div>
                </div>
              );
            })}
          </div>

          {standaloneTables.length > 0 && (
            <div className="space-y-4 mt-4">
              {standaloneTables.map((table, idx) => {
                const tableKey = `table-${idx}-${table[0]?.join('|') || 'data'}`;
                return (
                  <div key={tableKey} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-100/50 border-b border-gray-200">
                      <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span>📊</span>
                        참고 정보
                      </h3>
                    </div>
                    <div className="px-4 py-3 bg-white/80">
                      {renderTable(table)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex items-start gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
        <span>💡</span>
        <span>자세한 내용은 예약 페이지에서 확인해 주세요. 정보는 변경될 수 있습니다.</span>
      </div>
    </div>
  );
}

export default DetailContent;
