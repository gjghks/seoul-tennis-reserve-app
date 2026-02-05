import DOMPurify from 'dompurify';
import { ContentItem, ContentSection, FeeInfo, InfoCard } from '@/components/court-detail/types';

const SECTION_KEYWORDS = [
  '테니스장\\s*이용\\s*안내', '이용\\s*안내', '접수\\s*안내', '주차\\s*관련', '주차장\\s*이용',
  '환불\\s*규정', '환불규정', '예약\\s*안내', '예약\\s*주의', '이용\\s*주의', '이용\\s*제한',
  '기타\\s*안내', '영리\\s*행위\\s*금지', '사용료', '이용요금\\s*안내', '이용요금', '이용시간',
  '주의\\s*사항', '공통\\s*사항', '이용\\s*방법', '입금\\s*안내', '우천\\s*취소', '예약\\s*변경',
  '코트장', '개인\\s*강습', '시설물\\s*보수', '향후\\s*예약', '공지\\s*사항', '대관\\s*기준',
  '대관방법', '운영시간', '양도.*금지', '불이익.*적용', '편법.*금지', '테니스장\\s*이용수칙'
].join('|');

const TEXT_HEADER_PATTERN = new RegExp(`^[★☆▢]?\\s*(${SECTION_KEYWORDS})`, 'i');
const SECTION_SPLIT_PATTERN = new RegExp(
  `(?=` +
  `\\n+[○◎□◈★▢]|` +
  `\\n◇[^◇\\n]+◇|` +
  `\\n◈[^◈\\n]+◈|` +
  `\\n〈[^〉\\n]+〉|` +
  `\\n\\[[^\\]\\n]{2,}\\]|` +
  `\\n【[^】\\n]+】|` +
  `\\n\\s*(?:${SECTION_KEYWORDS})\\s*[\\n\\-:]` +
  `)`,
  'i'
);

const INLINE_HEADING_PATTERN = /^(예약\s*주의\s*사항|이용\s*주의\s*사항|환불\s*규정|이용\s*안내|접수\s*안내|주차\s*안내|취소\s*및\s*환불|예약\s*안내|기타\s*안내)$/i;
const INFO_PATTERN = /(운영시간\s*:|이용요금\s*:|조명시설\s*:|1회\s*\d+시간)/g;

const NUMBERED_KEYWORDS = '결제|이용요금|예약|환불|주의|안내|노쇼|양도|이용질서|대기자|부정|안전|오픈|원칙|제도|금지|규정|정리|사용료|매일';
const STRUCTURED_HEADING_PATTERN = new RegExp(`^\\d+\\.\\s*(${NUMBERED_KEYWORDS})(?:\\s|$|\\()`);

const CAUTION_SUBHEADING_PATTERNS = [
  /^코트\s*(?:이용\s*)?(?:예약\s*)?(?:질서\s*)?관련$/,
  /^유의사항$/,
  /^위반시?\s*불이익/,
  /^◈\s*위반시?\s*불이익/,
  /^이용\s*(?:질서\s*)?관련$/,
  /^예약\s*(?:이용\s*)?관련$/,
  /^이용규칙\s*위반시?\s*제재\s*사항$/,
  /사용규칙$/,
  /^이용료\s*감면\s*혜택$/,
  /^주의사항\s*-\s*필독$/,
  /^사용료\s*\(/,
  /^환불\s*규정$/,
];

const STRUCTURED_SUBHEADING_PATTERNS = [
  /^기본\s*주의사항$/,
  /^환불\s*없이\s*퇴장/,
  /^사업자\s*정보$/,
  /^필수\s*준수$/,
  /^이용\s*제한\s*안내$/,
  /^예약\s*주의\s*사항$/,
  /^이용\s*주의\s*사항$/,
  /^환불\s*규정$/,
  /^코트\s*(?:이용\s*)?(?:예약\s*)?(?:질서\s*)?관련$/,
  /^유의사항$/,
  /^위반시?\s*불이익/,
  /^◈\s*위반시?\s*불이익/,
  /^이용\s*(?:질서\s*)?관련$/,
  /^예약\s*(?:이용\s*)?관련$/,
  /^이용규칙\s*위반시?\s*제재\s*사항$/,
  /사용규칙$/,
  /^이용료\s*감면\s*혜택$/,
  /^주의사항\s*-\s*필독$/,
  /^사용료\s*\(/,
];

const FEE_KEYWORDS = ['실내 대관료', '실외 대관료', '조명료', '대관료'];
const INFO_KEYWORDS = ['운영시간', '휴관안내', '대관방법', '시설현황'];

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

const cleanupTagRemnants = (text: string) => text
  .replace(/\bmeta\s+(?:charset|name|content|http-equiv)[^/\n]*\/?\s*/gi, '')
  .replace(/^\s*\/\s*$/gm, '')
  .replace(/\/?main\b/gi, '')
  .replace(/\/?header\b(?!\s*:)/gi, '')
  .replace(/\/?footer\b/gi, '')
  .replace(/\/?section\b/gi, '')
  .replace(/\/?article\b/gi, '')
  .replace(/\b(div|span)\s+class="[^"]*"/gi, '')
  .replace(/(\d+)(결제|이용요금|예약|환불|주의|안내|노쇼|양도|이용질서|대기자|부정|안전|오픈|원칙|제도|금지|규정|정리)/g, '$1. $2')
  .replace(/본\s*안내문은\s*서울시\s*공공예약\s*페이지\s*게시\s*목적의\s*안내문입니다\.\s*\(출력\/모바일\s*열람\s*가능\)/g, '');

const extractTitle = (line: string): { title: string; content: string } => {
  let cleaned = line;
  
  if (/^[○◎□▢]/.test(cleaned)) {
    cleaned = cleaned.replace(/^[○◎□▢]\s*/, '');
  } else if (/^[★☆]/.test(cleaned)) {
    cleaned = cleaned.replace(/^[★☆]\s*/, '');
  } else if (/^◈/.test(cleaned) || /◈$/.test(cleaned)) {
    cleaned = cleaned.replace(/^◈\s*/, '').replace(/\s*◈$/, '');
  } else if (/^◇/.test(cleaned) && /◇$/.test(cleaned)) {
    cleaned = cleaned.replace(/^◇\s*/, '').replace(/\s*◇$/, '');
  } else if (/^〈/.test(cleaned) && /〉$/.test(cleaned)) {
    cleaned = cleaned.replace(/^〈\s*/, '').replace(/\s*〉$/, '');
  } else if (/^\[/.test(cleaned) && /\]$/.test(cleaned)) {
    cleaned = cleaned.replace(/^\[\s*/, '').replace(/\s*\]$/, '');
  } else if (/^【/.test(cleaned) && /】$/.test(cleaned)) {
    cleaned = cleaned.replace(/^【\s*/, '').replace(/\s*】$/, '');
  }
  
  const colonMatch = cleaned.match(/^([^:]+):\s*(.+)/);
  if (colonMatch && colonMatch[1].length < 30) {
    return { title: colonMatch[1].trim(), content: colonMatch[2].trim() };
  }
  
  const periodMatch = cleaned.match(/^([^.]+\.)\s*(.*)/);
  if (periodMatch && periodMatch[1].length <= 60 && periodMatch[2]) {
    return { title: periodMatch[1].trim(), content: periodMatch[2].trim() };
  }
  
  return { title: cleaned.trim(), content: '' };
};

const parseFacilityInfo = (text: string): ContentSection[] | null => {
  const hasTabIndentedContent = text.split('\n').some(l => /^\t[^\t]/.test(l) && l.trim());
  const isFacilityFormat = /테니스장\s*이용\s*?안내/.test(text) && 
    (/운영시간/.test(text) || /대관료/.test(text)) &&
    hasTabIndentedContent;
  
  if (!isFacilityFormat) return null;
  
  const lines = text.split('\n');
  const result: ContentSection[] = [];
  
  let titleLine = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && /테니스장\s*이용\s*?안내/.test(trimmed)) {
      titleLine = trimmed;
      break;
    }
  }
  
  const feeTypes: FeeInfo[] = [];
  const infoCards: InfoCard[] = [];
  const notes: string[] = [];
  let refundTable: string[][] | null = null;
  
  let currentHeader = '';
  let currentUnit = '';
  let currentItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const isTabbed = line.startsWith('\t') && !line.startsWith('\t\t\t');
    
    if (trimmed.startsWith('※')) {
      notes.push(trimmed);
      continue;
    }
    
    if (trimmed.startsWith('예시')) {
      notes.push(trimmed);
      continue;
    }
    
    if (/환불\s*규정/.test(trimmed)) {
      const tableContent = lines.slice(i + 1).join('\n');
      refundTable = parseTabTable(tableContent, '환불 규정');
      break;
    }
    
    if (isTabbed && !trimmed.startsWith('-')) {
      if (currentHeader) {
        const isFeeHeader = FEE_KEYWORDS.some(k => currentHeader.includes(k));
        const isInfoHeader = INFO_KEYWORDS.some(k => currentHeader.includes(k));
        
        if (isFeeHeader && currentItems.length > 0) {
          const weekday = currentItems.find(item => /평일/.test(item))?.replace(/^\-\s*/, '') || '';
          const weekend = currentItems.find(item => /야간|주말|공휴일/.test(item))?.replace(/^\-\s*/, '') || '';
          const lighting = currentItems.find(item => /원$/.test(item) && !/평일|야간|주말/.test(item))?.replace(/^\-\s*/, '') || '';
          
          if (currentHeader.includes('조명료')) {
            feeTypes.push({ type: '조명료', unit: currentUnit, weekday: lighting || weekday, weekend: '' });
          } else {
            feeTypes.push({ type: currentHeader, unit: currentUnit, weekday, weekend });
          }
        } else if (isInfoHeader && currentItems.length > 0) {
          infoCards.push({ label: currentHeader, items: currentItems.map(item => item.replace(/^\-\s*/, '')) });
        } else if (currentHeader.includes('시설현황')) {
          infoCards.unshift({ label: '시설현황', items: [currentItems.join(' ').replace(/^\-\s*/, '') || currentHeader.replace('시설현황', '').replace(/^\s*:\s*/, '').trim()] });
        }
      }
      
      if (/시설현황\s*:/.test(trimmed)) {
        const facilityDesc = trimmed.replace(/시설현황\s*:\s*/, '').trim();
        if (facilityDesc) {
          infoCards.unshift({ label: '시설현황', items: [facilityDesc] });
        }
        currentHeader = '';
        currentUnit = '';
        currentItems = [];
      } else if (/^\([^)]+\)$/.test(trimmed)) {
        currentUnit = trimmed;
      } else {
        currentHeader = trimmed;
        currentUnit = '';
        currentItems = [];
      }
    } else if (trimmed.startsWith('-')) {
      currentItems.push(trimmed);
    }
  }
  
  if (currentHeader && currentItems.length > 0) {
    const isFeeHeader = FEE_KEYWORDS.some(k => currentHeader.includes(k));
    const isInfoHeader = INFO_KEYWORDS.some(k => currentHeader.includes(k));
    
    if (isFeeHeader) {
      const weekday = currentItems.find(item => /평일/.test(item))?.replace(/^\-\s*/, '') || '';
      const weekend = currentItems.find(item => /야간|주말|공휴일/.test(item))?.replace(/^\-\s*/, '') || '';
      feeTypes.push({ type: currentHeader, unit: currentUnit, weekday, weekend });
    } else if (isInfoHeader) {
      infoCards.push({ label: currentHeader, items: currentItems.map(item => item.replace(/^\-\s*/, '')) });
    }
  }
  
  if (infoCards.length > 0) {
    result.push({
      title: titleLine || '시설 안내',
      items: [],
      table: null,
      infoCards: infoCards
    });
  }
  
  if (feeTypes.length > 0) {
    result.push({
      title: '대관료 안내',
      items: [],
      table: null,
      feeTable: feeTypes
    });
  }
  
  if (notes.length > 0) {
    result.push({
      title: '할인 및 유의사항',
      items: notes.map(note => ({
        type: note.startsWith('※') ? 'warning' as const : 'text' as const,
        text: note.replace(/^※\s*/, ''),
        indent: 0
      })),
      table: null
    });
  }
  
  if (refundTable && refundTable.length > 0) {
    result.push({
      title: '환불 규정',
      items: [],
      table: refundTable
    });
  }
  
  return result.length > 0 ? result : null;
};

const parseStructuredContent = (text: string, isMainContent: boolean, skipTitle?: string): ContentItem[] => {
  const rawLines = text.split('\n');
  const expandedLines: string[] = [];
  
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      expandedLines.push(line);
      continue;
    }
    
    if ((trimmed.match(/○/g) || []).length > 1) {
      const parts = trimmed.split(/(?=○)/).map(p => p.trim()).filter(p => p);
      expandedLines.push(...parts);
      continue;
    }
    
    if (INFO_PATTERN.test(line) && line.length > 80) {
      const expanded = line
        .replace(/(운영시간\s*:)/g, '\n$1')
        .replace(/(이용요금\s*:)/g, '\n$1')
        .replace(/(조명시설\s*:)/g, '\n$1')
        .replace(/(1회\s*\d+시간)/g, '\n$1')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      expandedLines.push(...expanded);
    } else {
      expandedLines.push(line);
    }
  }
  
  const items: ContentItem[] = [];
  
  let afterHeading = false;
  let lastWasNumbered = false;
  let lastWasBullet = false;
  
  for (const line of expandedLines) {
    const trimmedText = line.trim();
    if (!trimmedText || trimmedText.length < 2) continue;
    if (line.startsWith('\t\t\t')) continue;
    if (skipTitle && trimmedText.includes(skipTitle)) continue;
    
    let cleanLine = trimmedText;
    let indent = 0;
    let itemType: ContentItem['type'] = 'text';
    
    const isHeading = (isMainContent && STRUCTURED_HEADING_PATTERN.test(trimmedText)) ||
                      (!isMainContent && STRUCTURED_SUBHEADING_PATTERNS.some(p => p.test(trimmedText.replace(/^◈\s*/, ''))));
    
    const isNumberedItem = /^\d+\.(?:\s|[가-힣])/.test(trimmedText);
    const isCircleBullet = trimmedText.startsWith('○');
    const isSquareBullet = trimmedText.startsWith('□');
    const isDiamondMarker = trimmedText.startsWith('◈');
    const isBulletItem = /^[-•·◦]/.test(trimmedText) || trimmedText.startsWith('※');
    const isParenthetical = /^\([^)]+\)/.test(trimmedText);
    const isExample = /^예시\)/.test(trimmedText);
    const isInfoItem = /^(운영시간\s*:|이용요금\s*:|조명시설\s*:|1회\s*\d+시간)/.test(trimmedText);
    const isStarNote = trimmedText.startsWith('*') && !trimmedText.startsWith('**');
    const isPenaltyItem = /^\d+차\s*:/.test(trimmedText) || /^부정\s*예약\s*:/.test(trimmedText) || /^\d+차이후\s*:/.test(trimmedText);
    
    if (isHeading) {
      cleanLine = trimmedText.replace(/^◈\s*/, '');
      itemType = 'heading';
      afterHeading = true;
      lastWasNumbered = false;
      lastWasBullet = false;
    } else if (isDiamondMarker) {
      cleanLine = trimmedText.replace(/^◈\s*/, '');
      itemType = 'heading';
      afterHeading = true;
      lastWasNumbered = false;
      lastWasBullet = false;
    } else if (isPenaltyItem) {
      indent = 1;
      lastWasBullet = true;
    } else if (isNumberedItem) {
      indent = 1;
      cleanLine = trimmedText.replace(/^\d+\.\s*/, '');
      lastWasNumbered = true;
      lastWasBullet = false;
    } else if (trimmedText.match(/^\d+\)\s/)) {
      indent = 1;
      cleanLine = trimmedText.replace(/^\d+\)\s*/, '');
      lastWasNumbered = true;
      lastWasBullet = false;
    } else if (isCircleBullet) {
      indent = 1;
      cleanLine = trimmedText.replace(/^○\s*/, '');
      lastWasBullet = true;
    } else if (isSquareBullet) {
      indent = 1;
      cleanLine = trimmedText.replace(/^□\s*/, '');
      lastWasBullet = true;
    } else if (isBulletItem) {
      indent = lastWasBullet ? 2 : 1;
      if (trimmedText.startsWith('※')) {
        cleanLine = trimmedText.replace(/^※\s*/, '');
        itemType = 'warning';
      } else {
        cleanLine = trimmedText.replace(/^[-•·◦]\s*/, '');
      }
    } else if (trimmedText.startsWith('-')) {
      indent = lastWasBullet ? 2 : 1;
      cleanLine = trimmedText.replace(/^\-\s*/, '');
      itemType = 'subtext';
    } else if (isStarNote) {
      indent = lastWasBullet ? 2 : 1;
      cleanLine = trimmedText.replace(/^\*\s*/, '');
      itemType = 'warning';
    } else if (isParenthetical) {
      indent = 2;
      itemType = 'subtext';
    } else if (isExample) {
      indent = 2;
      itemType = 'subtext';
    } else if (isInfoItem) {
      indent = 2;
      itemType = 'subtext';
    } else if (trimmedText.match(/^(상호명|사업자\s*번호|대표자|주소|대표\s*번호)$/)) {
      itemType = 'subtext';
    } else if (line.startsWith('\t') || afterHeading) {
      indent = lastWasNumbered || lastWasBullet ? 2 : 1;
    }
    
    if (STRUCTURED_SUBHEADING_PATTERNS.some(p => p.test(cleanLine.replace(/^◈\s*/, '')))) {
      cleanLine = cleanLine.replace(/^◈\s*/, '');
      itemType = 'heading';
      indent = 0;
      lastWasNumbered = false;
      lastWasBullet = false;
    }
    
    if (cleanLine && cleanLine.length > 1) {
      items.push({ type: itemType, text: cleanLine, indent });
    }
  }
  return items;
};

export const restoreHtmlTags = (text: string): string => {
  let result = text;
  
  result = result.replace(/style\s+type="text\/css"([\s\S]*?)\/style/gi, '<style type="text/css">$1</style>');
  
  result = result.replace(/\/(style|div|span|main|header|footer|section|article|nav|aside|h[1-6]|p|ul|ol|li|table|tr|td|th|thead|tbody|dl|dd|dt|b|strong|em|i|u)\b/gi, '</$1>');
  
  result = result.replace(/\b(div|span|main|header|footer|section|article|nav|aside|h[1-6]|p|ul|ol|li|table|tr|td|th|thead|tbody|dl|dd|dt|a)\s+((?:(?:class|id|style|href|src|alt)="[^"]*"\s*)+)/gi, '<$1 $2>');
  
  result = result.replace(/(\n|^|\s)(main|header|footer|section|article|nav|aside)(\s|\n)/gi, '$1<$2>$3');
  
  return result;
};

export const isHtmlRenderingReliable = (html: string): boolean => {
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

export const getSanitizedHtml = (content: string) => {
  let html = content
    .replace(/<!--\[data-hwpjson\][\s\S]*?-->/g, '')
    .replace(/1\.\s*공공시설\s*예약서비스[\s\S]*?2\.\s*시설예약[\s\S]*?혜택을\s*받으실\s*수\s*있습니다\./gi, '')
    .replace(/1\.\s*공공시설[\s\S]*?3\.\s*상세내용/gi, '')
    .replace(/4\.\s*주의사항\s*(?:meta\s+[^/]*\/\s*)*/gi, '<hr/><h2>주의사항</h2>');
  
  html = html.replace(/\bmeta\s+(?:charset|name|content|http-equiv)[^/]*\/?\s*/gi, '');
  
  html = restoreHtmlTags(html);
  
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

export const parseTabTable = (rawText: string, sectionTitle?: string): string[][] | null => {
  const lines = rawText.split(/\r?\n/);
  const blocks: string[][] = [];
  let currentBlock: string[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tabCount = (line.match(/^\t+/) || [''])[0].length;
    const cellContent = line.replace(/^\t+/, '').trim();

    if (tabCount >= 3 && cellContent) {
      inTable = true;
      currentBlock.push(cellContent);
    } else if (tabCount === 2 && !cellContent && currentBlock.length > 0) {
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
    block.some(cell => {
      if (cell.startsWith('·')) return true;
      if (cell.startsWith('-') && cell.length > 1 && cell[1] === ' ') return true;
      return false;
    })
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

  return filteredBlocks.map((block, idx) => 
    idx === 0 ? block : mergeToTargetCount(block, headerColCount)
  );
};

export const parseContent = (content: string): { sections: ContentSection[]; standaloneTables: string[][][] } => {
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
  
  cleanText = cleanupTagRemnants(cleanText);
  cautionContent = cleanupTagRemnants(cautionContent);

  const facilityParsed = parseFacilityInfo(cleanText);
  if (facilityParsed) {
    sections.push(...facilityParsed);
    
    if (cautionContent.trim()) {
      const cautionItems: ContentItem[] = [];
      cautionContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('※')) {
          cautionItems.push({ type: 'warning', text: trimmed.replace(/^※\s*/, ''), indent: 0 });
        } else {
          cautionItems.push({ type: 'text', text: trimmed, indent: 0 });
        }
      });
      if (cautionItems.length > 0) {
        sections.push({ title: '주의사항', items: cautionItems, table: null });
      }
    }
    
    return { sections, standaloneTables };
  }

  const sectionParts = cleanText.split(SECTION_SPLIT_PATTERN);

  sectionParts.forEach(part => {
    if (!part.trim()) return;

    const allLines = part.split('\n');
    const nonEmptyLines = allLines.filter(l => l.trim());
    if (nonEmptyLines.length === 0) return;

    let titleLine = '';
    let contentStartIdx = 1;
    
    const firstLine = nonEmptyLines[0].trim();
    
    let firstLineContent = '';
    
    const hasMarker = /^[○◎□▢★☆◈◇〈【\[]/.test(firstLine) || /[◈◇〉】\]]$/.test(firstLine);
    
    if (hasMarker) {
      const extracted = extractTitle(firstLine);
      titleLine = extracted.title;
      firstLineContent = extracted.content;
    } else if (TEXT_HEADER_PATTERN.test(firstLine)) {
      titleLine = firstLine.trim();
    } else {
      for (let i = 0; i < Math.min(5, nonEmptyLines.length); i++) {
        const line = nonEmptyLines[i].trim();
        const lineHasMarker = /^[○◎□▢★☆◈◇〈【\[]/.test(line) || /[◈◇〉】\]]$/.test(line);
        if (lineHasMarker || TEXT_HEADER_PATTERN.test(line)) {
          const extracted = extractTitle(line);
          titleLine = extracted.title;
          firstLineContent = extracted.content;
          contentStartIdx = i + 1;
          break;
        }
      }
      if (!titleLine) return;
    }
    
    if (!titleLine || titleLine.match(/^(공공시설|시설예약|상세내용|이\s*용\s*안\s*내|1\.|2\.|3\.)/)) return;
    if (titleLine.length > 60) return;

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
      
      const isNewItem = /^[-◽▪※•*◦▷◈▶►└◇\[(]/.test(trimmed) || /^\d+[.)]\s/.test(trimmed) || /^예시\)/.test(trimmed);
      
      if (!isNewItem && mergedLines.length > 0 && !mergedLines[mergedLines.length - 1].startsWith('\t')) {
        mergedLines[mergedLines.length - 1] = mergedLines[mergedLines.length - 1] + ' ' + trimmed;
      } else {
        mergedLines.push(line);
      }
    }

    const expandedLines: string[] = [];
    for (const line of mergedLines) {
      if (INFO_PATTERN.test(line) && line.length > 80) {
        const expanded = line
          .replace(/(운영시간\s*:)/g, '\n$1')
          .replace(/(이용요금\s*:)/g, '\n$1')
          .replace(/(조명시설\s*:)/g, '\n$1')
          .replace(/(1회\s*\d+시간)/g, '\n$1')
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        expandedLines.push(...expanded);
      } else {
        expandedLines.push(line);
      }
    }

    const items: ContentItem[] = [];
    const titleNormalized = titleLine.replace(/\s+/g, '');
    let lastWasNumbered = false;
    
    if (firstLineContent) {
      items.push({ type: 'text', text: firstLineContent, indent: 0 });
    }
    
    expandedLines.forEach(line => {
      const tabCount = (line.match(/^\t+/) || [''])[0].length;
      if (tabCount >= 3) return;
      
      const text = line.trim();
      if (!text) return;
      if (text.match(/^[\d]+\.\s*(공공시설|시설예약)/)) return;
      
      const isGarbage = 
        /^-+$/.test(text) ||
        /^상호명?\s*[-:]?\s*$/.test(text) ||
        /^대표자명?\s*[-:]?\s*$/.test(text) ||
        /^사업자\s*등록\s*번호\s*[-:]?\s*$/.test(text) ||
        /^사업장\s*주소\s*[-:]?\s*$/.test(text) ||
        /^-\s*상호명/.test(text) ||
        /^-\s*대표자/.test(text) ||
        /^-\s*사업자/.test(text) ||
        text.length < 2;
      if (isGarbage) return;
      
      const textNormalized = text.replace(/\s+/g, '');
      if (textNormalized === titleNormalized || 
          (titleNormalized.length > 3 && textNormalized.includes(titleNormalized))) return;

      let indent = tabCount > 0 ? 1 : 0;
      let cleanLine = text;
      let itemType: ContentItem['type'] = 'text';
      
      const isNumberedItem = /^\d+\.\s/.test(text);
      const isBulletItem = /^[-•◦◇▶►]/.test(text) || text.startsWith('※');
      const isParenthetical = /^\([^)]+\)/.test(text);
      const isExample = /^예시\)/.test(text);
      const isInfoItem = /^(운영시간\s*:|이용요금\s*:|조명시설\s*:|1회\s*\d+시간)/.test(text);

      if (isExample) {
        indent = 2;
        itemType = 'subtext';
      } else if (isInfoItem) {
        indent = 2;
        itemType = 'subtext';
      } else if (text.startsWith('└')) {
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
      } else if (isNumberedItem) {
        indent = 1;
        cleanLine = text.replace(/^\d+\.\s*/, '');
        lastWasNumbered = true;
      } else if (text.match(/^\(\d+\)\s/)) {
        indent = 1;
        cleanLine = text.replace(/^\(\d+\)\s*/, '');
        lastWasNumbered = true;
      } else if (text.startsWith('-')) {
        indent = lastWasNumbered ? 2 : 1;
        cleanLine = text.replace(/^\-\s*/, '');
        if (/^예시\)/.test(cleanLine)) {
          indent = 2;
          itemType = 'subtext';
        }
      } else if (text.startsWith('※')) {
        indent = lastWasNumbered ? 2 : 1;
        cleanLine = text.replace(/^※\s*/, '');
        itemType = 'warning';
      } else if (text.startsWith('▶') || text.startsWith('►')) {
        indent = lastWasNumbered ? 2 : 1;
        cleanLine = text.replace(/^[▶►]\s*/, '');
      } else if (text.startsWith('•') || text.startsWith('◦') || text.startsWith('◇')) {
        indent = lastWasNumbered ? 2 : 1;
        cleanLine = text.replace(/^[•◦◇]\s*/, '');
        if (/^예시\)/.test(cleanLine)) {
          indent = 2;
          itemType = 'subtext';
        }
      } else if (text.startsWith('○')) {
        indent = 1;
        cleanLine = text.replace(/^○\s*/, '');
      } else if (text.startsWith('┌') || text.startsWith('┕')) {
        indent = 1;
        cleanLine = text.replace(/^[┌┕]\s*/, '');
      } else if (text.startsWith('*') && !text.startsWith('**')) {
        indent = lastWasNumbered ? 2 : 1;
        cleanLine = text.replace(/^\*\s*/, '');
        if (/디지털\s*약자|만\s*65세/.test(cleanLine)) {
          itemType = 'warning';
        }
      } else if (isParenthetical) {
        indent = 2;
        itemType = 'subtext';
      } else if (text.match(/^◈.*◈$/)) {
        return;
      }

      if (INLINE_HEADING_PATTERN.test(cleanLine)) {
        items.push({ type: 'heading', text: cleanLine, indent: 0 });
        lastWasNumbered = false;
        return;
      }

      if (cleanLine.includes(':') && !cleanLine.match(/\d{1,2}:\d{2}/) && !cleanLine.match(/^https?:/)) {
        const colonIdx = cleanLine.indexOf(':');
        const key = cleanLine.slice(0, colonIdx).trim();
        const val = cleanLine.slice(colonIdx + 1).trim();
        if (key.length > 0 && key.length < 25 && val && !/^예시\)$/.test(key)) {
          items.push({ type: 'keyvalue', text: val, key, indent });
          return;
        }
      }

      if (/^예시\)/.test(cleanLine) && itemType === 'text') {
        indent = 2;
        itemType = 'subtext';
      }

      if (cleanLine && cleanLine.length > 1) {
        items.push({ type: itemType, text: cleanLine, indent });
      }
    });

    if (items.length > 0 || table || titleLine) {
      sections.push({ title: titleLine, items, table });
    }
  });

  if (cautionContent.trim()) {
    const rawCautionLines = cautionContent.split('\n');
    
    const expandedCautionLines: string[] = [];
    for (const line of rawCautionLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if ((trimmed.match(/○/g) || []).length > 1) {
        const parts = trimmed.split(/(?=○)/).map(p => p.trim()).filter(p => p);
        expandedCautionLines.push(...parts);
      } else {
        expandedCautionLines.push(trimmed);
      }
    }
    
    const mergedCautionLines: string[] = [];
    for (const trimmed of expandedCautionLines) {
      if (!trimmed) continue;
      
      const isNewItem = /^[-※•◦○◈▶►□\*\(\d]/.test(trimmed) || 
                        /^\d+차\s*:/.test(trimmed) ||
                        /^부정\s*예약\s*:/.test(trimmed) ||
                        CAUTION_SUBHEADING_PATTERNS.some(p => p.test(trimmed));
      
      if (!isNewItem && mergedCautionLines.length > 0) {
        mergedCautionLines[mergedCautionLines.length - 1] += ' ' + trimmed;
      } else {
        mergedCautionLines.push(trimmed);
      }
    }
    
    const cautionItems: ContentItem[] = [];
    let lastWasSubheading = false;
    let lastWasBullet = false;
    
    for (const text of mergedCautionLines) {
      if (!text || text.length < 2) continue;
      
      let cleanLine = text;
      let indent = 0;
      let itemType: ContentItem['type'] = 'text';
      
      const isSubheading = CAUTION_SUBHEADING_PATTERNS.some(p => p.test(text.replace(/^◈\s*/, '')));
      const isPenaltyItem = /^\d+차\s*:/.test(text) || /^부정\s*예약\s*:/.test(text) || /^\d+차이후\s*:/.test(text);
      
      if (isSubheading) {
        cleanLine = text.replace(/^◈\s*/, '');
        itemType = 'heading';
        indent = 0;
        lastWasSubheading = true;
        lastWasBullet = false;
      } else if (isPenaltyItem) {
        indent = 1;
        itemType = 'text';
        lastWasBullet = true;
      } else if (text.startsWith('○')) {
        indent = 1;
        cleanLine = text.replace(/^○\s*/, '');
        lastWasBullet = true;
        lastWasSubheading = false;
      } else if (text.startsWith('◈')) {
        cleanLine = text.replace(/^◈\s*/, '');
        itemType = 'heading';
        indent = 0;
        lastWasSubheading = true;
        lastWasBullet = false;
      } else if (text.startsWith('□')) {
        indent = 1;
        cleanLine = text.replace(/^□\s*/, '');
        lastWasBullet = true;
      } else if (text.match(/^\(\d+\)\s/)) {
        indent = 1;
        cleanLine = text.replace(/^\(\d+\)\s*/, '');
        lastWasBullet = true;
      } else if (text.startsWith('-')) {
        indent = lastWasBullet ? 2 : 1;
        cleanLine = text.replace(/^\-\s*/, '');
        itemType = 'subtext';
      } else if (text.startsWith('*')) {
        indent = lastWasBullet ? 2 : 1;
        cleanLine = text.replace(/^\*\s*/, '');
        itemType = 'warning';
      } else if (text.startsWith('※')) {
        indent = 1;
        cleanLine = text.replace(/^※\s*/, '');
        itemType = 'warning';
      } else if (text.startsWith('•') || text.startsWith('◦')) {
        indent = 1;
        cleanLine = text.replace(/^[•◦]\s*/, '');
        lastWasBullet = true;
      } else {
        if (lastWasSubheading) {
          indent = 0;
        } else if (lastWasBullet) {
          indent = 2;
          itemType = 'subtext';
        }
      }
      
      if (cleanLine && cleanLine.length > 1) {
        cautionItems.push({ type: itemType, text: cleanLine, indent });
      }
    }
    
    if (cautionItems.length > 0) {
      sections.push({ title: '주의사항', items: cautionItems, table: null });
    }
  }

  const hasNumberedStructure = new RegExp(`\\d+\\.\\s*(${NUMBERED_KEYWORDS})`).test(cleanText);
  
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
