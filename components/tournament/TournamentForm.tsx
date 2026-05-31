'use client';

import { useState, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/ui/Spinner';
import { DISTRICTS } from '@/lib/constants/districts';

interface Tournament {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  format: string;
  match_type: string;
  scoring_format: string;
  no_ad_scoring: boolean;
  max_participants: number;
  status: string;
  share_token: string | null;
  is_public: boolean;
  draw_type: string;
  play_date: string | null;
  location: string | null;
  district: string | null;
  court_name: string | null;
  court_count: number | null;
  created_at: string;
  updated_at: string;
}

// NOTE: Only single-elimination is currently supported by the draw engine
// (lib/bracket-engine.ts). Round-robin formats are gated until their generators exist;
// re-add them here once the draw route handles tournament.format.
const FORMAT_OPTIONS = [
  { value: 'single_elimination', label: '싱글 엘리미네이션', emoji: '🏆', desc: '지면 탈락. 가장 일반적인 토너먼트 방식' },
];

const MATCH_TYPE_OPTIONS = [
  { value: 'singles', label: '단식', emoji: '🧑', desc: '1:1 개인전' },
  { value: 'mens_doubles', label: '남복', emoji: '👬', desc: '남자 2인 복식' },
  { value: 'womens_doubles', label: '여복', emoji: '👭', desc: '여자 2인 복식' },
  { value: 'mixed_doubles', label: '혼복', emoji: '👫', desc: '남녀 혼합 복식' },
  { value: 'random_doubles', label: '잡복', emoji: '🎲', desc: '성별 무관, 파트너 랜덤 배정' },
];

const SCORING_FORMAT_OPTIONS = [
  { value: 'games_4', label: '4게임', desc: '빠른 진행. 동호회 월례대회 추천' },
  { value: 'games_6', label: '6게임', desc: '정규 한 세트. 클럽 대회 기본' },
  { value: 'pro_set_8', label: '8게임 프로세트', desc: '한 세트로 결판. 시간 제한 시 적합' },
  { value: 'tiebreak_10', label: '10포인트 타이브레이크', desc: '초고속 결판. 많은 참가자 소화에 유리' },
  { value: 'best_of_3', label: '3세트 매치', desc: '정식 경기. 결승전이나 중요 대회용' },
];

const PARTICIPANTS_OPTIONS = [
  { value: 4, label: '4명', desc: '2라운드 (4강→결승)' },
  { value: 8, label: '8명', desc: '3라운드 (8강→4강→결승)' },
  { value: 16, label: '16명', desc: '4라운드' },
  { value: 32, label: '32명', desc: '5라운드' },
];

const DRAW_TYPE_OPTIONS = [
  { value: 'random', label: '랜덤 추첨', emoji: '🎲', desc: '모든 참가자를 무작위로 배치' },
  { value: 'seeded', label: '시드 배정', emoji: '🎯', desc: '상위 시드를 대진표 상하단에 분리 배치' },
  { value: 'manual', label: '수동 배치', emoji: '✋', desc: '주최자가 직접 대진표 위치를 지정' },
];

interface TournamentFormState {
  title: string;
  description: string;
  format: string;
  match_type: string;
  scoring_format: string;
  no_ad_scoring: boolean;
  max_participants: number;
  draw_type: string;
  play_date: string;
  location: string;
  district: string;
  court_name: string;
  court_count: number;
}

type TournamentFormAction =
  | { type: 'setField'; field: keyof TournamentFormState; value: string | number | boolean }
  | { type: 'reset'; payload: TournamentFormState };

function formReducer(state: TournamentFormState, action: TournamentFormAction): TournamentFormState {
  switch (action.type) {
    case 'setField':
      return { ...state, [action.field]: action.value };
    case 'reset':
      return action.payload;
    default:
      return state;
  }
}

function getInitialState(initialData?: Partial<Tournament>): TournamentFormState {
  return {
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    format: initialData?.format ?? FORMAT_OPTIONS[0].value,
    match_type: initialData?.match_type ?? MATCH_TYPE_OPTIONS[0].value,
    scoring_format: initialData?.scoring_format ?? SCORING_FORMAT_OPTIONS[1].value,
    no_ad_scoring: initialData?.no_ad_scoring ?? true,
    max_participants: initialData?.max_participants ?? PARTICIPANTS_OPTIONS[1].value,
    draw_type: initialData?.draw_type ?? DRAW_TYPE_OPTIONS[0].value,
    play_date: initialData?.play_date ? initialData.play_date.split('T')[0] : new Date().toISOString().split('T')[0],
    location: initialData?.location ?? '',
    district: initialData?.district ?? DISTRICTS[0].nameKo,
    court_name: initialData?.court_name ?? '',
    court_count: initialData?.court_count ?? 0,
  };
}

interface TournamentFormProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<Tournament>;
}

export default function TournamentForm({ mode = 'create', initialData }: TournamentFormProps) {
  const { user } = useAuth();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, dispatch] = useReducer(formReducer, initialData, getInitialState);

  const setField = useCallback(
    (field: keyof TournamentFormState, value: string | number | boolean) => {
      dispatch({ type: 'setField', field, value });
    },
    []
  );

  const validate = useCallback(() => {
    if (!state.title.trim()) {
      showToast('대회명을 입력해주세요.', 'error');
      return false;
    }

    if (!state.play_date) {
      showToast('경기 날짜를 선택해주세요.', 'error');
      return false;
    }

    if (state.title.length > 100) {
      showToast('대회명은 100자 이내로 입력해주세요.', 'error');
      return false;
    }

    if (state.description.length > 500) {
      showToast('설명은 500자 이내로 입력해주세요.', 'error');
      return false;
    }

    return true;
  }, [state.title, state.play_date, state.description, showToast]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!user) {
        showToast('대회 생성은 로그인 후 이용할 수 있습니다.', 'error');
        router.push('/login?redirect=/tournaments/new');
        return;
      }

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          title: state.title.trim(),
          description: state.description.trim() || null,
          format: state.format,
          match_type: state.match_type,
          scoring_format: state.scoring_format,
          no_ad_scoring: state.no_ad_scoring,
          max_participants: Number(state.max_participants),
          draw_type: state.draw_type,
          play_date: state.play_date || null,
          location: state.location.trim() || null,
          district: state.district || null,
          court_name: state.court_name.trim() || null,
          court_count: state.court_count > 0 ? state.court_count : null,
        };

        const endpoint = mode === 'edit' && initialData?.id ? `/api/tournaments/${initialData.id}` : '/api/tournaments';
        const method = mode === 'edit' ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || '대회 저장에 실패했습니다.');
        }

        const createdId = data.tournament?.id || data.id;
        if (!createdId) {
          throw new Error('대회 ID를 확인할 수 없습니다.');
        }

        showToast(mode === 'edit' ? '대회 정보가 수정되었습니다.' : '대회가 생성되었습니다.', 'success');
        router.push(`/tournaments/${createdId}`);
      } catch (error) {
        showToast(error instanceof Error ? error.message : '대회 저장 중 오류가 발생했습니다.', 'error');
        setIsSubmitting(false);
      }
    },
    [user, validate, state, mode, initialData?.id, showToast, router]
  );

  const labelClass = cn('block mb-2 text-sm', themeClass('font-black text-black', 'font-bold text-gray-700'));
  const inputClass = cn(
    'w-full px-4 py-3 outline-none transition-all',
    themeClass(
      'bg-white border-2 border-black rounded-[5px] font-bold text-black focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]',
      'bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500'
    )
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className={cn(
          'p-6 space-y-6',
          themeClass(
            'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
            'bg-white rounded-2xl border border-gray-100 shadow-sm'
          )
        )}
      >
        <div>
          <label htmlFor="title" className={labelClass}>
            대회명 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={state.title}
            onChange={(event) => setField('title', event.target.value)}
            maxLength={100}
            required
            className={inputClass}
            placeholder="예: 송파구 주말 미니 토너먼트"
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            설명
          </label>
          <textarea
            id="description"
            value={state.description}
            onChange={(event) => setField('description', event.target.value)}
            maxLength={500}
            className={cn(inputClass, 'min-h-[120px] resize-y')}
            placeholder="참가 자격, 진행 방식, 준비물 등을 적어주세요"
          />
        </div>

        <div>
          <span className={labelClass}>
            대회 형식 <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-1 gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all',
                  state.format === option.value
                    ? themeClass(
                        'bg-[#22c55e]/10 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-50 border-2 border-green-600 rounded-xl'
                      )
                    : themeClass(
                        'bg-white border-2 border-black/20 rounded-[5px] hover:border-black',
                        'bg-white border border-gray-200 rounded-xl hover:border-gray-300'
                      )
                )}
              >
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={state.format === option.value}
                  onChange={() => setField('format', option.value)}
                  className="sr-only"
                />
                <span className="text-xl shrink-0">{option.emoji}</span>
                <div className="min-w-0">
                  <div className={cn('text-sm', themeClass('font-black text-black', 'font-bold text-gray-900'))}>{option.label}</div>
                  <div className={cn('text-xs mt-0.5', themeClass('text-black/60', 'text-gray-500'))}>{option.desc}</div>
                </div>
                {state.format === option.value && (
                  <span className={cn('ml-auto text-sm shrink-0', themeClass('text-black font-black', 'text-green-600 font-bold'))}>✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>
            경기 종류 <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MATCH_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all',
                  state.match_type === option.value
                    ? themeClass(
                        'bg-[#22c55e]/10 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-50 border-2 border-green-600 rounded-xl'
                      )
                    : themeClass(
                        'bg-white border-2 border-black/20 rounded-[5px] hover:border-black',
                        'bg-white border border-gray-200 rounded-xl hover:border-gray-300'
                      )
                )}
              >
                <input
                  type="radio"
                  name="match_type"
                  value={option.value}
                  checked={state.match_type === option.value}
                  onChange={() => setField('match_type', option.value)}
                  className="sr-only"
                />
                <span className="text-xl shrink-0">{option.emoji}</span>
                <div className="min-w-0">
                  <div className={cn('text-sm', themeClass('font-black text-black', 'font-bold text-gray-900'))}>{option.label}</div>
                  <div className={cn('text-xs mt-0.5', themeClass('text-black/60', 'text-gray-500'))}>{option.desc}</div>
                </div>
                {state.match_type === option.value && (
                  <span className={cn('ml-auto text-sm shrink-0', themeClass('text-black font-black', 'text-green-600 font-bold'))}>✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>
            스코어 형식 <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-1 gap-2">
            {SCORING_FORMAT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all',
                  state.scoring_format === option.value
                    ? themeClass(
                        'bg-[#22c55e]/10 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-50 border-2 border-green-600 rounded-xl'
                      )
                    : themeClass(
                        'bg-white border-2 border-black/20 rounded-[5px] hover:border-black',
                        'bg-white border border-gray-200 rounded-xl hover:border-gray-300'
                      )
                )}
              >
                <input
                  type="radio"
                  name="scoring_format"
                  value={option.value}
                  checked={state.scoring_format === option.value}
                  onChange={() => setField('scoring_format', option.value)}
                  className="sr-only"
                />
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm', themeClass('font-black text-black', 'font-bold text-gray-900'))}>{option.label}</div>
                  <div className={cn('text-xs mt-0.5', themeClass('text-black/60', 'text-gray-500'))}>{option.desc}</div>
                </div>
                {state.scoring_format === option.value && (
                  <span className={cn('ml-auto text-sm shrink-0', themeClass('text-black font-black', 'text-green-600 font-bold'))}>✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>
            최대 참가자 <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PARTICIPANTS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-3 cursor-pointer transition-all text-center',
                  state.max_participants === option.value
                    ? themeClass(
                        'bg-[#22c55e]/10 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-50 border-2 border-green-600 rounded-xl'
                      )
                    : themeClass(
                        'bg-white border-2 border-black/20 rounded-[5px] hover:border-black',
                        'bg-white border border-gray-200 rounded-xl hover:border-gray-300'
                      )
                )}
              >
                <input
                  type="radio"
                  name="max_participants"
                  value={option.value}
                  checked={state.max_participants === option.value}
                  onChange={() => setField('max_participants', option.value)}
                  className="sr-only"
                />
                <div className={cn('text-lg', themeClass('font-black text-black', 'font-bold text-gray-900'))}>{option.label}</div>
                <div className={cn('text-xs', themeClass('text-black/60', 'text-gray-500'))}>{option.desc}</div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>
            추첨 방식 <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DRAW_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all',
                  state.draw_type === option.value
                    ? themeClass(
                        'bg-[#22c55e]/10 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-50 border-2 border-green-600 rounded-xl'
                      )
                    : themeClass(
                        'bg-white border-2 border-black/20 rounded-[5px] hover:border-black',
                        'bg-white border border-gray-200 rounded-xl hover:border-gray-300'
                      )
                )}
              >
                <input
                  type="radio"
                  name="draw_type"
                  value={option.value}
                  checked={state.draw_type === option.value}
                  onChange={(event) => setField('draw_type', event.target.value)}
                  className="sr-only"
                />
                <span className="text-lg shrink-0">{option.emoji}</span>
                <div className="min-w-0">
                  <div className={cn('text-sm', themeClass('font-black text-black', 'font-bold text-gray-900'))}>{option.label}</div>
                  <div className={cn('text-xs mt-0.5', themeClass('text-black/60', 'text-gray-500'))}>{option.desc}</div>
                </div>
                {state.draw_type === option.value && (
                  <span className={cn('ml-auto text-sm shrink-0', themeClass('text-black font-black', 'text-green-600 font-bold'))}>✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.no_ad_scoring}
            onChange={(event) => setField('no_ad_scoring', event.target.checked)}
            className={cn(
              'w-4 h-4 rounded',
              themeClass('border-2 border-black text-black focus:ring-0 checked:bg-black', 'border-gray-300 text-green-600')
            )}
          />
          <span className={cn('text-sm', themeClass('font-bold text-black', 'font-medium text-gray-700'))}>
            노애드 (듀스 없음)
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="play_date" className={labelClass}>
              경기 날짜 <span className="text-red-500">*</span>
            </label>
            <input
              id="play_date"
              type="date"
              value={state.play_date}
              onChange={(event) => setField('play_date', event.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>
              장소
            </label>
            <input
              id="location"
              type="text"
              value={state.location}
              onChange={(event) => setField('location', event.target.value)}
              className={inputClass}
              placeholder="예: 올림픽공원"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="district" className={labelClass}>
              자치구
            </label>
            <select
              id="district"
              value={state.district}
              onChange={(event) => setField('district', event.target.value)}
              className={inputClass}
            >
              {DISTRICTS.map((district) => (
                <option key={district.slug} value={district.nameKo}>
                  {district.nameKo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="court_name" className={labelClass}>
              코트명
            </label>
            <input
              id="court_name"
              type="text"
              value={state.court_name}
              onChange={(event) => setField('court_name', event.target.value)}
              className={inputClass}
              placeholder="예: 올림픽공원 3번 코트"
            />
          </div>
        </div>

        <div>
          <label htmlFor="court_count" className={labelClass}>
            사용 코트 수
          </label>
          <p className={cn('text-xs mb-2', themeClass('text-black/50', 'text-gray-400'))}>
            입력하면 대진 추첨 시 매치별로 코트 번호가 자동 배정됩니다.
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
              <label
                key={count}
                className={cn(
                  'flex items-center justify-center px-3 py-2.5 cursor-pointer transition-all text-center',
                  state.court_count === count
                    ? themeClass(
                        'bg-[#22c55e]/10 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-50 border-2 border-green-600 rounded-xl'
                      )
                    : themeClass(
                        'bg-white border-2 border-black/20 rounded-[5px] hover:border-black',
                        'bg-white border border-gray-200 rounded-xl hover:border-gray-300'
                      )
                )}
              >
                <input
                  type="radio"
                  name="court_count"
                  value={count}
                  checked={state.court_count === count}
                  onChange={() => setField('court_count', count)}
                  className="sr-only"
                />
                <span className={cn('text-sm', themeClass('font-black text-black', 'font-bold text-gray-900'))}>
                  {count === 0 ? '미지정' : `${count}면`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/tournaments"
          className={cn(
            'flex-1 py-4 text-center transition-all',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] uppercase',
              'bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 shadow-sm'
            )
          )}
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-[2] py-4 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            themeClass(
              'bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] uppercase',
              'bg-green-600 rounded-xl font-bold text-white hover:bg-green-700 shadow-md'
            )
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="border-current border-t-transparent" />
              저장 중...
            </span>
          ) : mode === 'edit' ? (
            '대회 수정하기'
          ) : (
            '대회 만들기'
          )}
        </button>
      </div>
    </form>
  );
}
