export const mergeToTargetCount = (cells: string[], targetCount: number): string[] => {
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

export const cleanupTagRemnants = (text: string) => text
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

export const extractTitle = (line: string): { title: string; content: string } => {
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
