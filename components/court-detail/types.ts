export interface ContentItem {
  type: 'text' | 'subtext' | 'warning' | 'keyvalue' | 'heading';
  text: string;
  key?: string;
  indent: number;
}

export interface ContentSection {
  title: string;
  items: ContentItem[];
  table: string[][] | null;
  feeTable?: FeeInfo[];
  infoCards?: InfoCard[];
}

export interface FeeInfo {
  type: string;
  unit?: string;
  weekday?: string;
  weekend?: string;
}

export interface InfoCard {
  label: string;
  items: string[];
}
