export type Gender = 'male' | 'female';

export interface UserProfile {
  nickname: string | null;
  bio: string | null;
  gender: Gender | null;
  full_name: string | null;
  avatar_url: string | null;
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;
export const BIO_MAX = 50;

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9_]+$/;

export function validateNickname(nickname: string): string | null {
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    return `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자 사이여야 합니다.`;
  }
  if (!NICKNAME_REGEX.test(nickname)) {
    return '닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다.';
  }
  return null;
}

export function getDisplayName(profile: { nickname?: string | null; full_name?: string | null; email?: string | null }): string {
  return profile.nickname || profile.full_name || profile.email?.split('@')[0] || '익명';
}

export function isProfileComplete(userProfile: UserProfile | null, ntrpRating: number | null): boolean {
  return !!(userProfile?.nickname && ntrpRating !== null && ntrpRating !== undefined);
}
