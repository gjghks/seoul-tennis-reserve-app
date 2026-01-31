'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { SeoulService } from '@/lib/seoulApi';
import { getDistrictBySlug } from '@/lib/constants/districts';
import { useTheme } from '@/contexts/ThemeContext';
import FavoriteButton from '@/components/favorite/FavoriteButton';

function StickyHeader({ 
  court, 
  isAvailable, 
  isVisible,
  isNeoBrutalism 
}: { 
  court: SeoulService; 
  isAvailable: boolean;
  isVisible: boolean;
  isNeoBrutalism: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className={`fixed top-14 left-0 right-0 z-40 transform transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`${
        isNeoBrutalism 
          ? 'bg-white border-b-[3px] border-black' 
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
      }`}>
        <div className="container py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold ${
                isNeoBrutalism
                  ? `border-2 border-black rounded-[3px] ${isAvailable ? 'bg-[#a3e635] text-black font-black' : 'bg-gray-200 text-black/60'}`
                  : `rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`
              }`}>
                {!isNeoBrutalism && <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />}
                {court.SVCSTATNM}
              </span>
              <h2 className={`truncate text-sm font-bold ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
                {court.SVCNM}
              </h2>
            </div>
            {court.SVCURL && isAvailable && (
              <a
                href={court.SVCURL}
                target="_blank"
                rel="noopener noreferrer"
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-all ${
                  isNeoBrutalism
                    ? 'bg-[#22c55e] text-black border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'
                    : 'bg-green-600 text-white rounded-lg hover:bg-green-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                예약
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ContentItem {
  type: 'text' | 'subtext' | 'warning' | 'keyvalue' | 'heading';
  text: string;
  key?: string;
  indent: number;
}

interface ContentSection {
  title: string;
  items: ContentItem[];
  table: string[][] | null;
}

function DetailContent({ content }: { content: string }) {
  const restoreHtmlTags = (text: string): string => {
    let result = text;
    
    // style 태그 복원
    result = result.replace(/style\s+type="text\/css"([\s\S]*?)\/style/gi, '<style type="text/css">$1</style>');
    
    // 닫는 태그 복원
    result = result.replace(/\/(style|div|span|main|header|footer|section|article|nav|aside|h[1-6]|p|ul|ol|li|table|tr|td|th|thead|tbody|dl|dd|dt|b|strong|em|i|u)\b/gi, '</$1>');
    
    // 열리는 태그 복원 (다중 속성 지원)
    result = result.replace(/\b(div|span|main|header|footer|section|article|nav|aside|h[1-6]|p|ul|ol|li|table|tr|td|th|thead|tbody|dl|dd|dt|a)\s+((?:(?:class|id|style|href|src|alt)="[^"]*"\s*)+)/gi, '<$1 $2>');
    
    // 열리는 태그 복원 (속성 없는 경우)
    result = result.replace(/(\n|^|\s)(main|header|footer|section|article|nav|aside)(\s|\n)/gi, '$1<$2>$3');
    
    return result;
  };
  
  const isHtmlRenderingReliable = (html: string): boolean => {
    const problematicPatterns = [
      /\bmeta\s+(?:charset|name|content)=/i,
      /\bstyle\s+type=/i,
      /[^<]\/(div|span|main|style)\b/i,
      /\b(div|span)\s+class="[^"]*"(?!>)/i,
      /주의사항\s*</i,
    ];
    
    for (const pattern of problematicPatterns) {
      if (pattern.test(html)) return false;
    }
    
    const tagCount = (html.match(/<[a-z][^>]*>/gi) || []).length;
    const textLength = html.replace(/<[^>]*>/g, '').length;
    
    if (tagCount < 3 && textLength > 500) return false;
    
    return true;
  };
  
  const contentWithoutHwpJson = content.replace(/<!--\[data-hwpjson\][\s\S]*?-->/g, '');
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(contentWithoutHwpJson) || 
                       /\bstyle\s+type=/i.test(contentWithoutHwpJson) ||
                       /\/style\b/i.test(contentWithoutHwpJson);
  
  const shouldRenderAsHtml = hasHtmlTags && isHtmlRenderingReliable(contentWithoutHwpJson);
  
  const getSanitizedHtml = () => {
    let html = content
      .replace(/<!--\[data-hwpjson\][\s\S]*?-->/g, '')
      .replace(/1\.\s*공공시설\s*예약서비스[\s\S]*?2\.\s*시설예약[\s\S]*?혜택을\s*받으실\s*수\s*있습니다\./gi, '')
      .replace(/1\.\s*공공시설[\s\S]*?3\.\s*상세내용/gi, '')
      // "4. 주의사항" 뒤의 손상된 meta 태그들 제거 (예: meta charset="utf-8" /meta name="viewport"...)
      .replace(/4\.\s*주의사항\s*(?:meta\s+[^/]*\/\s*)*/gi, '<hr/><h2>주의사항</h2>');
    
    // 복원되지 않은 meta 태그 패턴 제거 (예: meta charset="..." /, meta name="viewport"...)
    html = html.replace(/\bmeta\s+(?:charset|name|content|http-equiv)[^/]*\/?\s*/gi, '');
    
    html = restoreHtmlTags(html);
    
    // 복원된 <meta> 태그 완전 제거
    html = html.replace(/<meta[^>]*\/?>/gi, '');
    html = html.replace(/<\/?(?:head|title|html|body)[^>]*>/gi, '');
    
    const styleBlocks: string[] = [];
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
      let scopedCss = cssContent
        .replace(/:root\s*\{/g, '.seoul-detail-content {')
        .replace(/body\s*\{/g, '.seoul-detail-content {')
        .replace(/\*\s*\{/g, '.seoul-detail-content * {');
      
      scopedCss = scopedCss.replace(/([#.\w][\w\-]*)\s*\{/g, '.seoul-detail-content $1 {');
      scopedCss = scopedCss.replace(/\.seoul-detail-content\s+\.seoul-detail-content/g, '.seoul-detail-content');
      
      styleBlocks.push(scopedCss);
      return '';
    });
    
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div', 
                     'table', 'tr', 'td', 'th', 'thead', 'tbody', 
                     'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                     'a', 'img', 'hr', 'main', 'header', 'footer', 'section', 
                     'article', 'nav', 'aside', 'dl', 'dt', 'dd'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'id'],
      ALLOW_DATA_ATTR: false,
    });
    
    const styleTag = styleBlocks.length > 0 
      ? `<style>${styleBlocks.join('\n')}</style>` 
      : '';
    
    return styleTag + `<div class="seoul-detail-content">${sanitized}</div>`;
  };
  
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
  };

  const getStyle = (title: string) => {
    for (const [key, style] of Object.entries(sectionStyles)) {
      if (title.includes(key)) return style;
    }
    return { emoji: '📋', color: 'gray' };
  };

  const parseTabTable = (rawText: string, sectionTitle?: string): string[][] | null => {
    const lines = rawText.split(/\r?\n/);
    const blocks: string[][] = [];
    let currentBlock: string[] = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const tabCount = (line.match(/^\t+/) || [''])[0].length;
      const content = line.replace(/^\t+/, '').trim();

      if (tabCount >= 3 && content) {
        inTable = true;
        currentBlock.push(content);
      } else if (tabCount === 2 && !content && currentBlock.length > 0) {
        blocks.push([...currentBlock]);
        currentBlock = [];
      } else if (tabCount < 2 && inTable) {
        if (currentBlock.length > 0) {
          blocks.push([...currentBlock]);
          currentBlock = [];
        }
        inTable = false;
      }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);
    
    if (blocks.length < 2) return null;
    
    const titleNormalized = (sectionTitle || '').replace(/\s+/g, '');
    const filteredBlocks = blocks.filter(block => {
      if (block.length === 1) {
        const cellNormalized = block[0].replace(/\s+/g, '');
        if (cellNormalized === titleNormalized || 
            cellNormalized.includes(titleNormalized) || 
            titleNormalized.includes(cellNormalized)) {
          return false;
        }
      }
      return true;
    });
    
    if (filteredBlocks.length < 2) return null;
    
    const hasDataItems = filteredBlocks.some(block => 
      block.some(cell => cell.startsWith('-') || cell.startsWith('·'))
    );
    
    if (hasDataItems) {
      const rows: string[][] = [];
      let currentHeader = '';
      let currentData: string[] = [];
      
      for (const block of filteredBlocks) {
        for (let i = 0; i < block.length; i++) {
          const cell = block[i];
          const isDataItem = cell.startsWith('-') || cell.startsWith('·');
          const nextCell = block[i + 1];
          const nextIsDataItem = nextCell && (nextCell.startsWith('-') || nextCell.startsWith('·'));
          
          if (isDataItem) {
            currentData.push(cell);
          } else if (!isDataItem && (nextIsDataItem || (i === 0 && block.length > 1))) {
            if (currentHeader && currentData.length > 0) {
              rows.push([currentHeader, currentData.join('\n')]);
            }
            currentHeader = cell;
            currentData = [];
          } else if (currentData.length > 0) {
            currentData[currentData.length - 1] += ' ' + cell;
          } else if (currentHeader && !isDataItem) {
            currentData.push(cell);
          }
        }
      }
      
      if (currentHeader && currentData.length > 0) {
        rows.push([currentHeader, currentData.join('\n')]);
      }
      
      return rows.length >= 2 ? rows : null;
    }
    
    const headerColCount = filteredBlocks[0].length;
    if (headerColCount < 2) return null;

    const mergeToTargetCount = (cells: string[], targetCount: number): string[] => {
      if (cells.length <= targetCount) {
        const result = [...cells];
        while (result.length < targetCount) result.push('');
        return result;
      }
      
      const result = [...cells];
      while (result.length > targetCount) {
        result[result.length - 2] = result[result.length - 2] + ' ' + result[result.length - 1];
        result.pop();
      }
      return result;
    };

    return filteredBlocks.map((block, idx) => 
      idx === 0 ? block : mergeToTargetCount(block, headerColCount)
    );
  };

  const parseContent = (): { sections: ContentSection[]; standaloneTables: string[][][] } => {
    const sections: ContentSection[] = [];
    const standaloneTables: string[][][] = [];

    let cleanText = content
      .replace(/<!--\[data-hwpjson\][\s\S]*?-->/g, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/style\s+type="text\/css"[\s\S]*?\/style/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .replace(/(\d{1,2}일)[ ]{2,}(\d{1,2}일|\S+일)/g, '$1 ~ $2')
      .replace(/(\d{1,2}:\d{2})[ ]{2,}(\d{1,2}:\d{2})/g, '$1 ~ $2')
      .replace(/(\d{1,2}:\d{2})(\d{1,2}:\d{2})/g, '$1~$2')
      .replace(/(\d{1,2}월)[ ]{2,}(\d{1,2}월)/g, '$1 ~ $2')
      .replace(/\(([월화수목금])([월화수목금토일])\)/g, '($1~$2)')
      .replace(/\(([토일])([일])\)/g, '($1~$2)');

    const detailIdx = cleanText.indexOf('3. 상세내용');
    if (detailIdx > -1) {
      cleanText = cleanText.substring(detailIdx + '3. 상세내용'.length);
    }

    const cautionIdx = cleanText.indexOf('4. 주의사항');
    let cautionContent = '';
    if (cautionIdx > -1) {
      cautionContent = cleanText.substring(cautionIdx + '4. 주의사항'.length);
      cleanText = cleanText.substring(0, cautionIdx);
    }
    
    const cleanupTagRemnants = (text: string) => text
      .replace(/\bmeta\s+(?:charset|name|content|http-equiv)[^/\n]*\/?\s*/gi, '')
      .replace(/^\s*\/\s*$/gm, '')
      .replace(/\/?main\b/gi, '')
      .replace(/\/?header\b(?!\s*:)/gi, '')
      .replace(/\/?footer\b/gi, '')
      .replace(/\/?section\b/gi, '')
      .replace(/\/?article\b/gi, '')
      .replace(/\b(div|span)\s+class="[^"]*"/gi, '')
      .replace(/(\d+)(결제|이용요금|예약|환불|주의|안내|노쇼|양도|이용질서|대기자|부정|안전|본인|오픈|원칙|제도|금지|규정|정리)/g, '$1. $2')
      .replace(/본\s*안내문은\s*서울시\s*공공예약\s*페이지\s*게시\s*목적의\s*안내문입니다\.\s*\(출력\/모바일\s*열람\s*가능\)/g, '');
    
    cleanText = cleanupTagRemnants(cleanText);
    cautionContent = cleanupTagRemnants(cautionContent);

    const textHeaderPattern = /^[★☆]?\s*(.*테니스장\s*이용\s*안내|이용\s*안내|접수\s*안내|주차\s*관련|환불\s*규정.*|환불규정|예약\s*안내|예약\s*주의\s*사항|이용\s*주의\s*사항|이용\s*제한|기타\s*안내\s*사항|기타\s*안내|영리\s*행위\s*금지|편법\s*및\s*금지.*|이용시\s*주의.*|이용요금\s*안내|이용요금|사용료.*|향후\s*예약일정|예약\s*취소.*변경.*|불이익.*적용.*|주의\s*사항.*|주의사항)/i;
    
    const sectionParts = cleanText.split(/(?=\n[○◎□◈★]|\n◇[^◇]+◇|\n\[[^\]]{2,}\]|\n【[^】]+】|\n\s*(?:.*테니스장\s*이용\s*안내|이용\s*안내|접수\s*안내|주차\s*관련|환불\s*규정|환불규정|예약\s*안내|예약\s*주의사항|이용주의사항|이용\s*제한|기타\s*안내|영리\s*행위\s*금지|사용료|이용요금|주의\s*사항)\s*[\n\-])/);

    sectionParts.forEach(part => {
      if (!part.trim()) return;

      const allLines = part.split('\n');
      const nonEmptyLines = allLines.filter(l => l.trim());
      if (nonEmptyLines.length === 0) return;

      let titleLine = '';
      let contentStartIdx = 1;
      
      const firstLine = nonEmptyLines[0].trim();
      
      if (firstLine.match(/^[○◎□]/)) {
        titleLine = firstLine.replace(/^[○◎□]\s*/, '').trim();
      } else if (firstLine.match(/^[★☆]/)) {
        titleLine = firstLine.replace(/^[★☆]\s*/, '').trim();
      } else if (firstLine.match(/^◈/) || firstLine.match(/◈$/)) {
        titleLine = firstLine.replace(/^◈\s*/, '').replace(/\s*◈$/, '').trim();
      } else if (firstLine.match(/^◇/) && firstLine.match(/◇$/)) {
        titleLine = firstLine.replace(/^◇\s*/, '').replace(/\s*◇$/, '').trim();
      } else if (firstLine.match(/^\[/) && firstLine.match(/\]$/)) {
        titleLine = firstLine.replace(/^\[\s*/, '').replace(/\s*\]$/, '').trim();
      } else if (firstLine.match(/^【/) && firstLine.match(/】$/)) {
        titleLine = firstLine.replace(/^【\s*/, '').replace(/\s*】$/, '').trim();
      } else if (textHeaderPattern.test(firstLine)) {
        titleLine = firstLine.replace(/^[★☆]\s*/, '').trim();
      } else {
        for (let i = 0; i < Math.min(5, nonEmptyLines.length); i++) {
          const line = nonEmptyLines[i].trim();
          if (textHeaderPattern.test(line)) {
            titleLine = line.replace(/^[★☆]\s*/, '').trim();
            contentStartIdx = i + 1;
            break;
          }
        }
        if (!titleLine) return;
      }
      
      if (!titleLine || titleLine.match(/^(공공시설|시설예약|상세내용|이\s*용\s*안\s*내|1\.|2\.|3\.)/)) return;
      if (titleLine.length > 50) return;

      const firstLineIdx = allLines.findIndex(l => l.trim() === nonEmptyLines[0].trim());
      const contentLines = allLines.slice(firstLineIdx + 1);
      
      const table = parseTabTable(contentLines.join('\n'), titleLine);

      const mergedLines: string[] = [];
      for (const line of contentLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (line.startsWith('\t')) {
          mergedLines.push(line);
          continue;
        }
        
        const isNewItem = /^[-◽▪※•*◦▷◈▶►└◇\[(]/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);
        
        if (!isNewItem && mergedLines.length > 0 && !mergedLines[mergedLines.length - 1].startsWith('\t')) {
          mergedLines[mergedLines.length - 1] = mergedLines[mergedLines.length - 1] + ' ' + trimmed;
        } else {
          mergedLines.push(line);
        }
      }

      const items: ContentItem[] = [];
      const titleNormalized = titleLine.replace(/\s+/g, '');
      
      mergedLines.forEach(line => {
        const tabCount = (line.match(/^\t+/) || [''])[0].length;
        if (tabCount >= 3) return;
        
        const text = line.trim();
        if (!text) return;
        if (text.match(/^[\d]+\.\s*(공공시설|시설예약)/)) return;
        
        const textNormalized = text.replace(/\s+/g, '');
        if (textNormalized === titleNormalized || 
            (titleNormalized.length > 3 && textNormalized.includes(titleNormalized))) return;

        let indent = tabCount > 0 ? 1 : 0;
        let cleanLine = text;
        let itemType: ContentItem['type'] = 'text';

        if (text.startsWith('└')) {
          indent = 2;
          cleanLine = text.replace(/^└\s*/, '');
          itemType = 'subtext';
        } else if (text.startsWith('◽') || text.startsWith('▪')) {
          indent = 2;
          cleanLine = text.replace(/^[◽▪]\s*/, '');
          itemType = 'subtext';
        } else if (text.startsWith('▷')) {
          indent = 2;
          cleanLine = text.replace(/^▷\s*/, '');
          itemType = 'subtext';
        } else if (text.startsWith('-')) {
          indent = 1;
          cleanLine = text.replace(/^-\s*/, '');
        } else if (text.startsWith('※')) {
          indent = 1;
          cleanLine = text.replace(/^※\s*/, '');
          itemType = 'warning';
        } else if (text.startsWith('▶') || text.startsWith('►')) {
          indent = 1;
          cleanLine = text.replace(/^[▶►]\s*/, '');
        } else if (text.startsWith('•') || text.startsWith('◦') || text.startsWith('◇')) {
          indent = 1;
          cleanLine = text.replace(/^[•◦◇]\s*/, '');
        } else if (text.startsWith('*') && !text.startsWith('**')) {
          indent = 1;
          cleanLine = text.replace(/^\*\s*/, '');
        } else if (text.match(/^\(\d+\)\s/)) {
          indent = 1;
          cleanLine = text.replace(/^\(\d+\)\s*/, '');
        } else if (text.match(/^\d+\.\s/)) {
          indent = 1;
          cleanLine = text.replace(/^\d+\.\s*/, '');
        } else if (text.match(/^◈.*◈$/)) {
          return;
        }

        if (cleanLine.includes(':') && !cleanLine.match(/\d{1,2}:\d{2}/) && !cleanLine.match(/^https?:/)) {
          const colonIdx = cleanLine.indexOf(':');
          const key = cleanLine.slice(0, colonIdx).trim();
          const val = cleanLine.slice(colonIdx + 1).trim();
          if (key.length > 0 && key.length < 25 && val) {
            items.push({ type: 'keyvalue', text: val, key, indent });
            return;
          }
        }

        if (cleanLine && cleanLine.length > 1) {
          items.push({ type: itemType, text: cleanLine, indent });
        }
      });

      if (items.length > 0 || table) {
        sections.push({ title: titleLine, items, table });
      }
    });

    if (cautionContent.trim()) {
      const rawCautionLines = cautionContent.split('\n');
      const mergedCautionLines: string[] = [];
      
      for (const line of rawCautionLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        const isNewItem = /^[-※•◦▶►\(\d]/.test(trimmed);
        
        if (!isNewItem && mergedCautionLines.length > 0) {
          mergedCautionLines[mergedCautionLines.length - 1] += ' ' + trimmed;
        } else {
          mergedCautionLines.push(trimmed);
        }
      }
      
      const cautionItems: ContentItem[] = [];
      
      for (const text of mergedCautionLines) {
        if (!text || text.length < 3) continue;
        
        let cleanLine = text;
        let indent = 0;
        let itemType: ContentItem['type'] = 'text';
        
        if (text.match(/^\(\d+\)\s/)) {
          indent = 1;
          cleanLine = text.replace(/^\(\d+\)\s*/, '');
        } else if (text.startsWith('-')) {
          indent = 1;
          cleanLine = text.replace(/^-\s*/, '');
        } else if (text.startsWith('※')) {
          indent = 1;
          cleanLine = text.replace(/^※\s*/, '');
          itemType = 'warning';
        }
        
        if (cleanLine && cleanLine.length > 1) {
          cautionItems.push({ type: itemType, text: cleanLine, indent });
        }
      }
      
      if (cautionItems.length > 0) {
        sections.push({ title: '주의사항', items: cautionItems, table: null });
      }
    }

    const numberedKeywords = '결제|이용요금|예약|환불|주의|안내|노쇼|양도|이용질서|대기자|부정|안전|본인|오픈|원칙|제도|금지|규정|정리';
    const hasNumberedStructure = new RegExp(`\\d+\\.\\s*(${numberedKeywords})`).test(cleanText);
    
    const parseStructuredContent = (text: string, isMainContent: boolean, skipTitle?: string): ContentItem[] => {
      const lines = text.split('\n');
      const items: ContentItem[] = [];
      const headingPattern = new RegExp(`^\\d+\\.\\s*(${numberedKeywords})`);
      const subheadingPatterns = [
        /^기본\s*주의사항$/,
        /^환불\s*없이\s*퇴장/,
        /^사업자\s*정보$/,
        /^필수\s*준수$/,
        /^이용\s*제한\s*안내$/,
      ];
      
      let afterHeading = false;
      
      for (const line of lines) {
        const trimmedText = line.trim();
        if (!trimmedText || trimmedText.length < 2) continue;
        if (line.startsWith('\t\t\t')) continue;
        if (skipTitle && trimmedText.includes(skipTitle)) continue;
        
        let cleanLine = trimmedText;
        let indent = 0;
        let itemType: ContentItem['type'] = 'text';
        
        const isHeading = (isMainContent && headingPattern.test(trimmedText)) ||
                          (!isMainContent && subheadingPatterns.some(p => p.test(trimmedText)));
        
        if (isHeading) {
          itemType = 'heading';
          afterHeading = true;
        } else if (trimmedText.match(/^\d+\)\s/)) {
          indent = 1;
          cleanLine = trimmedText.replace(/^\d+\)\s*/, '');
        } else if (trimmedText.startsWith('-') || trimmedText.startsWith('•') || trimmedText.startsWith('·')) {
          indent = 1;
          cleanLine = trimmedText.replace(/^[-•·]\s*/, '');
        } else if (trimmedText.startsWith('※')) {
          indent = 1;
          cleanLine = trimmedText.replace(/^※\s*/, '');
          itemType = 'warning';
        } else if (trimmedText.match(/^(상호명|사업자\s*번호|대표자|주소|대표\s*번호)$/)) {
          itemType = 'subtext';
        } else if (line.startsWith('\t') || afterHeading) {
          indent = 1;
        }
        
        if (cleanLine && cleanLine.length > 1) {
          items.push({ type: itemType, text: cleanLine, indent });
        }
      }
      return items;
    };
    
    if (hasNumberedStructure || (sections.length === 0 && cleanText.trim().length > 50)) {
      sections.length = 0;
      
      const mainItems = parseStructuredContent(cleanText, true);
      if (mainItems.length > 0) {
        const titleMatch = cleanText.match(/([가-힣]+(?:공원|센터)?)\s*테니스장\s*이용\s*안내/);
        const sectionTitle = titleMatch ? titleMatch[0] : '이용 안내';
        sections.push({ title: sectionTitle, items: mainItems, table: null });
      }
      
      if (cautionContent.trim()) {
        const cautionTitleMatch = cautionContent.match(/([가-힣]+(?:공원|센터)?)\s*테니스장\s*주의사항/);
        const cautionTitle = cautionTitleMatch?.[0] || '주의사항';
        const cautionItems = parseStructuredContent(cautionContent, false, cautionTitle);
        if (cautionItems.length > 0) {
          sections.push({ title: cautionTitle, items: cautionItems, table: null });
        }
      }
    }

    return { sections, standaloneTables };
  };

  const { sections, standaloneTables } = parseContent();

  const highlight = (text: string): React.ReactNode => {
    const parts = text.split(/(\d{1,2}:\d{2}\s*[~∼－-]\s*\d{1,2}:\d{2}|[0-9,]+원|\d{1,2}월)/g);
    return parts.map((part, i) => {
      if (/\d{1,2}:\d{2}\s*[~∼－-]\s*\d{1,2}:\d{2}/.test(part)) {
        return <code key={i} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono text-xs">{part}</code>;
      }
      if (/[0-9,]+원/.test(part)) {
        return <code key={i} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-mono text-xs">{part}</code>;
      }
      if (/\d{1,2}월/.test(part)) {
        return <span key={i} className="font-medium text-blue-600">{part}</span>;
      }
      return part;
    });
  };

  const renderItem = (item: ContentItem, idx: number) => {
    const indentClass = item.indent === 2 ? 'ml-6' : item.indent === 1 ? 'ml-3' : '';
    
    if (item.type === 'heading') {
      return (
        <li key={idx} className="mt-4 mb-2 first:mt-0 list-none">
          <strong className="block font-bold text-gray-800 text-base border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 rounded-r">
            {item.text}
          </strong>
        </li>
      );
    }
    
    if (item.type === 'warning') {
      return (
        <li key={idx} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
          <span className="shrink-0 text-amber-500 font-bold">※</span>
          <span className="text-amber-800 text-sm">{highlight(item.text)}</span>
        </li>
      );
    }

    if (item.type === 'keyvalue' && item.key) {
      return (
        <li key={idx} className={`flex items-start gap-3 py-1 ${indentClass} list-none`}>
          <span className="shrink-0 font-semibold text-gray-600 text-sm min-w-[80px]">{item.key}</span>
          <span className="text-gray-700 text-sm">{highlight(item.text)}</span>
        </li>
      );
    }

    if (item.type === 'subtext') {
      return (
        <li key={idx} className={`flex items-start gap-2 py-0.5 ${indentClass} list-none text-gray-500 text-sm`}>
          <span className="shrink-0">◦</span>
          <span>{highlight(item.text)}</span>
        </li>
      );
    }

    if (item.indent >= 1) {
      return (
        <li key={idx} className={`flex items-start gap-2 py-1 ${indentClass} list-none`}>
          <span className="shrink-0 text-blue-500 font-bold">•</span>
          <span className="text-gray-700 text-sm leading-relaxed">{highlight(item.text)}</span>
        </li>
      );
    }

    return (
      <li key={idx} className="py-1 text-gray-700 text-sm list-none">{highlight(item.text)}</li>
    );
  };

  const renderTable = (rows: string[][]) => {
    if (rows.length === 0) return null;
    const header = rows[0];
    const body = rows.slice(1);

    return (
      <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {header.map((cell, i) => (
                <th key={i} className="px-3 py-2.5 text-center font-bold text-gray-800 border border-gray-200 whitespace-nowrap bg-gray-100">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className={`px-3 py-2 border border-gray-200 ${
                      cellIdx === 0 
                        ? 'font-semibold text-gray-700 bg-gray-50 text-center' 
                        : 'text-gray-600 text-center'
                    }`}
                  >
                    {highlight(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
            dangerouslySetInnerHTML={{ __html: getSanitizedHtml() }}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {sections.map((section, idx) => {
              const { emoji, color } = getStyle(section.title);
              const classes = colorClasses[color] || colorClasses.gray;

              return (
                <div
                  key={idx}
                  className={`rounded-xl border ${classes.border} ${classes.bg} overflow-hidden`}
                >
                  <div className={`px-4 py-3 ${classes.headerBg} border-b ${classes.border}`}>
                    <h3 className={`font-bold ${classes.title} flex items-center gap-2`}>
                      <span>{emoji}</span>
                      {section.title}
                    </h3>
                  </div>

                  <div className="px-4 py-3 bg-white/80">
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
              {standaloneTables.map((table, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
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
              ))}
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

export default function CourtDetailPage() {
  const params = useParams();
  const { isNeoBrutalism } = useTheme();
  const districtSlug = params.district as string;
  const courtId = decodeURIComponent(params.courtId as string);
  const district = getDistrictBySlug(districtSlug);

  const [court, setCourt] = useState<SeoulService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourt = async () => {
      if (!district) {
        setError('잘못된 지역입니다.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/tennis?district=${districtSlug}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const foundCourt = (data.courts || []).find(
          (c: SeoulService) => c.SVCID === courtId
        );

        if (!foundCourt) {
          setError('테니스장을 찾을 수 없습니다.');
        } else {
          setCourt(foundCourt);
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [districtSlug, courtId, district]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowStickyHeader(headerBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAvailable = court && (court.SVCSTATNM === '접수중' || court.SVCSTATNM.includes('예약가능'));

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className={`h-6 w-32 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded'}`} />
            <div className={`h-10 w-3/4 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded'}`} />
            <div className={`h-64 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded-2xl'}`} />
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`h-40 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded-xl'}`} />
              <div className={`h-40 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded-xl'}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !court || !district) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
        <div className={`text-center py-12 px-6 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]' : ''}`}>
          <div className={`w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
            isNeoBrutalism 
              ? 'bg-[#fb923c] border-2 border-black rounded-[5px]' 
              : 'bg-red-100 rounded-full'
          }`}>
            <svg className={`w-8 h-8 ${isNeoBrutalism ? 'text-black' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className={`mb-6 ${isNeoBrutalism ? 'text-black font-bold' : 'text-gray-600'}`}>
            {error || '테니스장을 찾을 수 없습니다.'}
          </p>
          <Link
            href={district ? `/${districtSlug}` : '/'}
            className={`inline-flex items-center gap-2 font-medium ${
              isNeoBrutalism 
                ? 'bg-[#88aaee] text-black border-2 border-black rounded-[5px] px-4 py-2 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-bold' 
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {district ? `${district.nameKo} 목록으로` : '홈으로 돌아가기'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
      <StickyHeader 
        court={court} 
        isAvailable={isAvailable || false} 
        isVisible={showStickyHeader}
        isNeoBrutalism={isNeoBrutalism}
      />
      <div ref={headerRef} className={isNeoBrutalism ? 'bg-white border-b-[3px] border-black' : 'bg-white border-b border-gray-100'}>
        <div className="container py-4">
          <nav className={`flex items-center gap-2 text-sm mb-4 ${isNeoBrutalism ? 'font-bold' : ''}`}>
            <Link href="/" className={isNeoBrutalism ? 'text-black hover:underline underline-offset-4' : 'text-gray-400 hover:text-green-600 transition-colors'}>
              홈
            </Link>
            <svg className={`w-4 h-4 ${isNeoBrutalism ? 'text-black' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/${districtSlug}`} className={isNeoBrutalism ? 'text-black hover:underline underline-offset-4' : 'text-gray-400 hover:text-green-600 transition-colors'}>
              {district.nameKo}
            </Link>
            <svg className={`w-4 h-4 ${isNeoBrutalism ? 'text-black' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={`truncate max-w-[180px] ${isNeoBrutalism ? 'text-black/70' : 'text-gray-600'}`}>{court.SVCNM}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold ${
                  isNeoBrutalism
                    ? `border-2 border-black rounded-[5px] ${isAvailable ? 'bg-[#a3e635] text-black font-black' : 'bg-gray-200 text-black/60'}`
                    : `rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`
                }`}>
                  {!isNeoBrutalism && <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />}
                  {court.SVCSTATNM}
                </span>
                <span className={`text-sm ${isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-400'}`}>{court.MINCLASSNM}</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl mb-2 break-keep ${isNeoBrutalism ? 'font-black text-black uppercase tracking-tight' : 'font-bold text-gray-900'}`}>
                {isNeoBrutalism ? `🎾 ${court.SVCNM}` : court.SVCNM}
              </h1>
              <p className={`flex items-center gap-2 ${isNeoBrutalism ? 'text-black/70 font-medium' : 'text-gray-500'}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {court.PLACENM}
              </p>
            </div>
            <FavoriteButton
              svcId={court.SVCID}
              svcName={court.SVCNM}
              district={court.AREANM}
              placeName={court.PLACENM}
              showLabel
            />
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="h-3" />
        {court.SVCURL && (
          <a
            href={court.SVCURL}
            target="_blank"
            rel="noopener noreferrer"
            className={isNeoBrutalism
              ? `w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[5px] font-black text-lg uppercase tracking-wide mb-8 border-[3px] border-black transition-all ${
                  isAvailable
                    ? 'bg-[#22c55e] text-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none'
                    : 'bg-gray-300 text-black/40 cursor-not-allowed'
                }`
              : `w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-8 ${
                  isAvailable
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-green-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`
            }
          >
            {isAvailable ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isNeoBrutalism ? '지금 예약!' : '지금 예약하기'}
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                예약 마감
              </>
            )}
          </a>
        )}

        {/* Image */}
        {court.IMGURL && !imageError && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-sm">
            <Image
              src={court.IMGURL}
              alt={court.SVCNM}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}

        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6`}>
          {[
            { icon: '🕐', label: '운영시간', value: `${court.V_MIN || '00:00'} - ${court.V_MAX || '24:00'}`, color: 'blue' },
            { icon: '💰', label: '이용료', value: court.PAYATNM || '정보 없음', color: 'green' },
            { icon: '📍', label: '지역', value: court.AREANM, color: 'purple' },
            { icon: '👥', label: '이용대상', value: court.USETGTINFO || '누구나', color: 'orange' },
          ].map((item, idx) => (
            <div key={idx} className={isNeoBrutalism
              ? 'bg-white border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000]'
              : `bg-white rounded-xl p-4 border border-gray-100 text-center`
            }>
              <div className={isNeoBrutalism
                ? 'w-10 h-10 bg-[#facc15] border-2 border-black rounded-[5px] flex items-center justify-center mx-auto mb-2 text-lg'
                : `w-10 h-10 bg-${item.color}-50 rounded-full flex items-center justify-center mx-auto mb-2`
              }>
                {isNeoBrutalism ? item.icon : (
                  <svg className={`w-5 h-5 text-${item.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className={isNeoBrutalism ? 'text-xs text-black/60 mb-1 font-bold uppercase' : 'text-xs text-gray-400 mb-1'}>{item.label}</p>
              <p className={isNeoBrutalism ? 'font-black text-black text-sm truncate' : 'font-semibold text-gray-800 text-sm truncate'}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* 접수 기간 */}
        {(court.RCPTBGNDT || court.RCPTENDDT) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-green-800">접수 기간</h3>
            </div>
            <p className="text-green-700 font-medium">
              {formatDate(court.RCPTBGNDT)} ~ {formatDate(court.RCPTENDDT)}
            </p>
          </div>
        )}

        {/* 시설 상세 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              시설 정보
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {court.PLACENM && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">위치</span>
                <span className="text-gray-900 font-medium text-sm">{court.PLACENM}</span>
              </div>
            )}
            {court.TELNO && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">연락처</span>
                <a href={`tel:${court.TELNO}`} className="text-green-600 font-medium text-sm hover:underline">
                  {court.TELNO}
                </a>
              </div>
            )}
            {(court.SVCOPNBGNDT || court.SVCOPNENDDT) && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">서비스 기간</span>
                <span className="text-gray-900 font-medium text-sm">
                  {formatDate(court.SVCOPNBGNDT)} ~ {formatDate(court.SVCOPNENDDT)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 상세 안내 - 섹션별 분류 */}
        {court.DTLCONT && <DetailContent content={court.DTLCONT} />}

        {/* Bottom Navigation */}
        <div className="flex gap-3">
          <Link
            href={`/${districtSlug}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            목록보기
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로
          </Link>
        </div>
      </div>

      {/* Floating CTA for Mobile */}
      {court.SVCURL && isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 sm:hidden">
          <a
            href={court.SVCURL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            지금 예약하기
          </a>
        </div>
      )}
    </div>
  );
}
