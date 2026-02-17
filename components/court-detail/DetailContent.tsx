'use client';

import { useMemo } from 'react';
import { InfoCard } from './types';
import { getSanitizedHtml, isHtmlRenderingReliable, parseContent } from '@/lib/utils/contentParser';
import { highlight } from './highlight';
import ContentItemComponent from './ContentItem';
import TableRenderer from './TableRenderer';
import FeeTable from './FeeTable';

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
                    {section.feeTable && section.feeTable.length > 0 && <FeeTable fees={section.feeTable} />}
                    {section.items.length > 0 && (
                      <ul className="space-y-0.5 list-none m-0 p-0">
                        {section.items.map((item, itemIdx) => <ContentItemComponent key={`${item.type}-${item.text}-${item.indent}-${itemIdx}`} item={item} idx={itemIdx} />)}
                      </ul>
                    )}
                    {section.table && section.table.length > 0 && <TableRenderer rows={section.table} />}
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
                      <TableRenderer rows={table} />
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
