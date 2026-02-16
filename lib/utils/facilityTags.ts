import { SeoulService } from '@/lib/seoulApi';
import { findEnrichment } from '@/lib/data/facilityEnrichment';
import type { SurfaceCategory } from '@/lib/data/facilityEnrichment';

export interface FacilityTag {
  key: string;
  label: string;
  icon: string;
  color: string;
}

const SURFACE_TAG_MAP: Record<string, { key: string; label: string; color: string }> = {
  clay: { key: 'surface-clay', label: '클레이', color: 'bg-orange-200' },
  artificial_grass: { key: 'surface-turf', label: '인조잔디', color: 'bg-lime-200' },
  hard: { key: 'surface-hard', label: '하드코트', color: 'bg-zinc-200' },
};

const TAG_LIMIT = 5;

const TAG_DEFINITIONS: Array<{
  key: string;
  label: string;
  icon: string;
  color: string;
  keywords: string[];
}> = [
  { key: 'lighting', label: '조명', icon: '💡', color: 'bg-yellow-200', keywords: ['야간조명', '나이터', '조명'] },
  { key: 'indoor', label: '실내', icon: '🏠', color: 'bg-sky-200', keywords: ['인도어', '실내'] },
  { key: 'outdoor', label: '실외', icon: '🌳', color: 'bg-emerald-200', keywords: ['아웃도어', '실외'] },
  { key: 'parking', label: '주차', icon: '🅿️', color: 'bg-blue-200', keywords: ['주차장', '주차'] },
  { key: 'shower', label: '샤워실', icon: '🚿', color: 'bg-cyan-200', keywords: ['샤워실', '샤워', '탈의'] },
  { key: 'surface-clay', label: '클레이', icon: '🎾', color: 'bg-orange-200', keywords: ['클레이'] },
  { key: 'surface-hard', label: '하드코트', icon: '🎾', color: 'bg-zinc-200', keywords: ['하드코트', '하드'] },
  { key: 'surface-turf', label: '인조잔디', icon: '🎾', color: 'bg-lime-200', keywords: ['인조잔디', '잔디코트'] },
];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function stripHtml(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function toMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(mins) || hours > 23 || mins > 59) return null;
  return hours * 60 + mins;
}

function extractReservationTag(text: string): FacilityTag | null {
  const monthlyMatch = text.match(/(?:월|한\s*달)\s*(\d{1,2})\s*회/);
  if (!monthlyMatch) return null;

  const count = Number(monthlyMatch[1]);
  if (Number.isNaN(count)) return null;

  return {
    key: 'reservation-limit',
    label: `월 ${count}회`,
    icon: '📅',
    color: 'bg-pink-200',
  };
}

export function extractFacilityTags(court: SeoulService): FacilityTag[] {
  const tags: FacilityTag[] = [];
  const seen = new Set<string>();

  const pushTag = (tag: FacilityTag) => {
    if (seen.has(tag.key) || tags.length >= TAG_LIMIT) return;
    seen.add(tag.key);
    tags.push(tag);
  };

  const payText = normalizeText(court.PAYATNM || '');
  if (payText.includes('무료')) {
    pushTag({ key: 'free', label: '무료', icon: '🆓', color: 'bg-emerald-200' });
  } else if (payText.includes('유료')) {
    pushTag({ key: 'paid', label: '유료', icon: '💳', color: 'bg-rose-200' });
  }

  const enrichment = findEnrichment(court.SVCNM, court.AREANM, court.PLACENM);

  if (enrichment && enrichment.courtCount > 0) {
    pushTag({ key: 'court-count', label: `${enrichment.courtCount}면`, icon: '🏟️', color: 'bg-violet-200' });
  }

  let surfaceHandled = false;
  if (enrichment) {
    const cat = enrichment.surfaceCategory as SurfaceCategory;
    const mapped = SURFACE_TAG_MAP[cat];
    if (mapped) {
      pushTag({ ...mapped, icon: '🎾' });
      surfaceHandled = true;
    } else if (cat === 'mixed' && enrichment.surfaces.length > 0) {
      const first = enrichment.surfaces[0].type;
      const matchedDef = TAG_DEFINITIONS.find(d =>
        d.key.startsWith('surface-') && d.keywords.some(kw => first.includes(kw))
      );
      if (matchedDef) {
        pushTag({ key: matchedDef.key, label: first, icon: '🎾', color: matchedDef.color });
        surfaceHandled = true;
      }
    }
  }

  const detailText = normalizeText(stripHtml(court.DTLCONT || ''));
  const nonSurfaceDefinitions = surfaceHandled
    ? TAG_DEFINITIONS.filter(d => !d.key.startsWith('surface-'))
    : TAG_DEFINITIONS;

  for (const definition of nonSurfaceDefinitions) {
    if (definition.keywords.some(keyword => detailText.includes(keyword))) {
      pushTag({
        key: definition.key,
        label: definition.label,
        icon: definition.icon,
        color: definition.color,
      });
    }
  }

  const reservationTag = extractReservationTag(detailText);
  if (reservationTag) {
    pushTag(reservationTag);
  }

  const endTime = toMinutes(court.V_MAX || '');
  if (endTime !== null && endTime >= 20 * 60) {
    pushTag({ key: 'night-available', label: '야간 이용 가능', icon: '🌙', color: 'bg-indigo-200' });
  }

  const svcName = normalizeText(court.SVCNM || '');
  const hasOutdoorInName = /야외|아웃도어/.test(svcName);
  const hasIndoorInName = /실내|인도어/.test(svcName);
  if (hasOutdoorInName && seen.has('indoor')) {
    const idx = tags.findIndex(t => t.key === 'indoor');
    if (idx !== -1) { tags.splice(idx, 1); seen.delete('indoor'); }
  }
  if (hasIndoorInName && seen.has('outdoor')) {
    const idx = tags.findIndex(t => t.key === 'outdoor');
    if (idx !== -1) { tags.splice(idx, 1); seen.delete('outdoor'); }
  }

  return tags;
}
