import type { MatchType, LocationType } from './tennis';
import type { ContactType } from './transfers';

export type MatchPostStatus = 'open' | 'closed' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type MatchSkillFilter = 'beginner' | 'intermediate' | 'advanced' | 'any';

export interface MatchPost {
  id: string;
  author_id: string;
  author_name: string;
  play_date: string;
  play_time_start: string;
  play_time_end: string | null;
  location_type: LocationType;
  court_id: string | null;
  court_name: string;
  district: string;
  match_type: MatchType;
  ntrp_min: number | null;
  ntrp_max: number | null;
  skill_level: MatchSkillFilter | null;
  max_participants: number;
  accepted_count: number;
  cost_per_person: number | null;
  title: string;
  description: string | null;
  contact_type: ContactType | null;
  contact_info: string | null;
  status: MatchPostStatus;
  created_at: string;
  updated_at: string;
  has_applied?: boolean;
  applications?: MatchApplication[];
}

export interface MatchApplication {
  id: string;
  post_id: string;
  applicant_id: string;
  applicant_name: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export const MATCH_POST_STATUS_LABELS: Record<MatchPostStatus, string> = {
  open: '모집중',
  closed: '마감',
  completed: '완료',
  cancelled: '취소',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '대기중',
  accepted: '수락',
  rejected: '거절',
  withdrawn: '취소',
};

export const MATCH_SKILL_FILTER_LABELS: Record<MatchSkillFilter, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '상급',
  any: '무관',
};

export const VALID_POST_STATUSES: MatchPostStatus[] = ['open', 'closed', 'completed', 'cancelled'];
export const VALID_APPLICATION_STATUSES: ApplicationStatus[] = ['pending', 'accepted', 'rejected', 'withdrawn'];
export const VALID_MATCH_SKILL_FILTERS: MatchSkillFilter[] = ['beginner', 'intermediate', 'advanced', 'any'];

export const MATCH_SKILL_FILTER_OPTIONS = VALID_MATCH_SKILL_FILTERS.map(k => ({
  value: k,
  label: MATCH_SKILL_FILTER_LABELS[k],
}));

export const PARTICIPANTS_OPTIONS = [
  { value: 1, label: '1명' },
  { value: 2, label: '2명' },
  { value: 3, label: '3명' },
];
