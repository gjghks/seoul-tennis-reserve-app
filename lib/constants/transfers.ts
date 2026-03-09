export type TransferStatus = 'available' | 'reserved' | 'completed' | 'cancelled' | 'expired';
export type ContactType = 'kakao' | 'phone';
export type InterestStatus = 'pending' | 'accepted' | 'rejected';

export interface CourtTransfer {
  id: string;
  seller_id: string;
  seller_name: string;
  court_id: string | null;
  court_name: string;
  district: string;
  play_date: string;
  play_time_start: string;
  play_time_end: string | null;
  original_price: number;
  asking_price: number;
  is_free: boolean;
  title: string;
  description: string | null;
  status: TransferStatus;
  buyer_id: string | null;
  buyer_name: string | null;
  contact_type?: ContactType;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

export interface TransferInterest {
  id: string;
  transfer_id: string;
  buyer_id: string;
  buyer_name: string;
  message: string | null;
  status: InterestStatus;
  created_at: string;
  updated_at: string;
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  available: '양도 가능',
  reserved: '예약중',
  completed: '양도 완료',
  cancelled: '취소',
  expired: '기간 만료',
};

export const INTEREST_STATUS_LABELS: Record<InterestStatus, string> = {
  pending: '승인 대기',
  accepted: '승인됨',
  rejected: '거절됨',
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  kakao: '카카오톡 ID',
  phone: '전화번호',
};

export const VALID_TRANSFER_STATUSES: TransferStatus[] = ['available', 'reserved', 'completed', 'cancelled', 'expired'];

export const TRANSFER_PAGE_SIZE = 20;
