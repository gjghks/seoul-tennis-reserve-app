import { mergeToTargetCount } from './textUtils';

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
