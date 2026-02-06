import DOMPurify from 'dompurify';

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
