export const AD_SLOTS = {
  HOME_TOP: process.env.NEXT_PUBLIC_AD_SLOT_HOME_TOP || '',
  HOME_BOTTOM: process.env.NEXT_PUBLIC_AD_SLOT_HOME_BOTTOM || '',
  DISTRICT_TOP: process.env.NEXT_PUBLIC_AD_SLOT_DISTRICT_TOP || '',
  COURT_DETAIL_MIDDLE: process.env.NEXT_PUBLIC_AD_SLOT_COURT_MIDDLE || '',
  COURT_DETAIL_BOTTOM: process.env.NEXT_PUBLIC_AD_SLOT_COURT_BOTTOM || '',
  SIDEBAR: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
