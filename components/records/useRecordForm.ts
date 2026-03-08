import { useCallback, useEffect, useReducer, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ToastType } from '@/contexts/ToastContext';
import type {
  CourtSurface,
  GameRecord,
  LocationType,
  MatchFormat,
  MatchResult,
  MatchScore,
  MatchType,
} from '@/lib/constants/tennis';
import { inferResult, validateScore } from '@/lib/utils/tennis';

interface RecordFormProps {
  mode: 'create' | 'edit';
  initialData?: GameRecord;
  onSuccess?: (record: GameRecord) => void;
}

interface UseRecordFormArgs extends RecordFormProps {
  user: User | null;
  showToast: (message: string, type?: ToastType) => void;
  prefillCourtName: string | null;
  prefillDistrict: string | null;
}

interface RecordFormState {
  playedAt: string;
  matchType: MatchType;
  matchFormat: MatchFormat;
  locationType: LocationType;
  courtId: string | null;
  courtName: string;
  district: string | null;
  score: MatchScore;
  result: MatchResult | null;
  isAutoInferred: boolean;
  courtSurface: CourtSurface | '';
  opponentName: string;
  opponentLevel: string;
  durationMinutes: string;
  cost: string;
  notes: string;
  validationErrors: Record<string, string>;
}

type RecordFormAction =
  | { type: 'setPlayedAt'; payload: string }
  | { type: 'setMatchType'; payload: MatchType }
  | { type: 'setMatchFormat'; payload: MatchFormat }
  | {
      type: 'setLocation';
      payload: {
        locationType: LocationType;
        courtId: string | null;
        courtName: string;
        district: string | null;
      };
    }
  | { type: 'setScore'; payload: MatchScore }
  | { type: 'setResult'; payload: MatchResult }
  | { type: 'setCourtSurface'; payload: CourtSurface | '' }
  | { type: 'setOpponentName'; payload: string }
  | { type: 'setOpponentLevel'; payload: string }
  | { type: 'setDurationMinutes'; payload: string }
  | { type: 'setCost'; payload: string }
  | { type: 'setNotes'; payload: string }
  | { type: 'setValidationErrors'; payload: Record<string, string> }
  | {
      type: 'applyQueryPrefill';
      payload: { courtName: string | null; district: string | null };
    };

function getInitialPlayedAt(initialData?: GameRecord): string {
  if (initialData?.played_at) {
    return new Date(initialData.played_at).toISOString().slice(0, 16);
  }
  return new Date().toISOString().slice(0, 16);
}

function createInitialState(initialData?: GameRecord): RecordFormState {
  return {
    playedAt: getInitialPlayedAt(initialData),
    matchType: initialData?.match_type || 'singles',
    matchFormat: initialData?.match_format || '6game_1set',
    locationType: initialData?.location_type || 'seoul_court',
    courtId: initialData?.court_id || null,
    courtName: initialData?.court_name || '',
    district: initialData?.district || null,
    score: initialData?.score || { sets: [{ my: 0, opp: 0 }] },
    result: initialData?.result || null,
    isAutoInferred: false,
    courtSurface: initialData?.court_surface || '',
    opponentName: initialData?.opponent_name || '',
    opponentLevel: initialData?.opponent_level || '',
    durationMinutes: initialData?.duration_minutes?.toString() || '',
    cost: initialData?.cost?.toString() || '',
    notes: initialData?.notes || '',
    validationErrors: {},
  };
}

function recordFormReducer(state: RecordFormState, action: RecordFormAction): RecordFormState {
  switch (action.type) {
    case 'setPlayedAt':
      return { ...state, playedAt: action.payload };
    case 'setMatchType':
      return { ...state, matchType: action.payload };
    case 'setMatchFormat':
      return { ...state, matchFormat: action.payload };
    case 'setLocation':
      return {
        ...state,
        locationType: action.payload.locationType,
        courtId: action.payload.courtId,
        courtName: action.payload.courtName,
        district: action.payload.district,
      };
    case 'setScore': {
      const inferred = inferResult(action.payload);
      if (inferred) {
        return {
          ...state,
          score: action.payload,
          result: inferred,
          isAutoInferred: true,
        };
      }
      return { ...state, score: action.payload };
    }
    case 'setResult':
      return { ...state, result: action.payload, isAutoInferred: false };
    case 'setCourtSurface':
      return { ...state, courtSurface: action.payload };
    case 'setOpponentName':
      return { ...state, opponentName: action.payload };
    case 'setOpponentLevel':
      return { ...state, opponentLevel: action.payload };
    case 'setDurationMinutes':
      return { ...state, durationMinutes: action.payload };
    case 'setCost':
      return { ...state, cost: action.payload };
    case 'setNotes':
      return { ...state, notes: action.payload };
    case 'setValidationErrors':
      return { ...state, validationErrors: action.payload };
    case 'applyQueryPrefill': {
      let nextState = state;

      if (action.payload.courtName) {
        nextState = {
          ...nextState,
          courtName: action.payload.courtName,
          locationType: 'custom',
        };
      }

      if (action.payload.district) {
        nextState = {
          ...nextState,
          district: action.payload.district,
        };
      }

      return nextState;
    }
    default:
      return state;
  }
}

export default function useRecordForm({
  mode,
  initialData,
  onSuccess,
  user,
  showToast,
  prefillCourtName,
  prefillDistrict,
}: UseRecordFormArgs) {
  const [state, dispatch] = useReducer(recordFormReducer, initialData, createInitialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'create' && !initialData) {
      dispatch({
        type: 'applyQueryPrefill',
        payload: {
          courtName: prefillCourtName,
          district: prefillDistrict,
        },
      });
    }
  }, [mode, initialData, prefillCourtName, prefillDistrict]);

  const handleUploadProgressChange = useCallback((progress: string | null) => {
    setUploadProgress(progress);
  }, []);

  const handleErrorChange = useCallback((message: string | null) => {
    setError(message);
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let validationError: string | null = null;

    if (!state.courtName.trim()) {
      newErrors.courtName = '장소(코트 이름)를 입력해주세요.';
      validationError = '장소(코트 이름)를 입력해주세요.';
    }

    const scoreValidation = validateScore(state.score);
    if (!scoreValidation.valid) {
      newErrors.score = scoreValidation.error || '스코어가 올바르지 않습니다.';
      validationError = scoreValidation.error || '스코어가 올바르지 않습니다.';
    }

    if (!state.result) {
      newErrors.result = '경기 결과를 선택해주세요.';
      validationError = '경기 결과를 선택해주세요.';
    }

    dispatch({ type: 'setValidationErrors', payload: newErrors });
    setError(validationError);

    return Object.keys(newErrors).length === 0;
  }, [state.courtName, state.score, state.result]);

  const submit = useCallback(
    async (uploadAndGetImageUrls: () => Promise<string[]>) => {
      if (!user) return;

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const finalImageUrls = await uploadAndGetImageUrls();

        const payload = {
          played_at: new Date(state.playedAt).toISOString(),
          duration_minutes: state.durationMinutes ? parseInt(state.durationMinutes, 10) : null,
          location_type: state.locationType,
          court_id: state.courtId,
          court_name: state.courtName,
          district: state.district,
          match_type: state.matchType,
          match_format: state.matchFormat,
          score: state.score,
          result: state.result,
          court_surface: state.courtSurface || null,
          opponent_name: state.opponentName || null,
          opponent_level: state.opponentLevel || null,
          cost: state.cost ? parseInt(state.cost, 10) : null,
          notes: state.notes || null,
          images: finalImageUrls,
        };

        const url = mode === 'create' ? '/api/records' : `/api/records/${initialData?.id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '기록 저장에 실패했습니다.');
        }

        showToast(
          mode === 'create' ? '경기 기록이 저장되었습니다.' : '경기 기록이 수정되었습니다.',
          'success'
        );
        onSuccess?.(data.record);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : '기록 저장 중 오류가 발생했습니다.'
        );
      } finally {
        setIsSubmitting(false);
        setUploadProgress(null);
      }
    },
    [
      user,
      validate,
      state.playedAt,
      state.durationMinutes,
      state.locationType,
      state.courtId,
      state.courtName,
      state.district,
      state.matchType,
      state.matchFormat,
      state.score,
      state.result,
      state.courtSurface,
      state.opponentName,
      state.opponentLevel,
      state.cost,
      state.notes,
      mode,
      initialData?.id,
      showToast,
      onSuccess,
    ]
  );

  return {
    state,
    isSubmitting,
    error,
    uploadProgress,
    submit,
    setPlayedAt: (value: string) => dispatch({ type: 'setPlayedAt', payload: value }),
    setMatchType: (value: MatchType) => dispatch({ type: 'setMatchType', payload: value }),
    setMatchFormat: (value: MatchFormat) => dispatch({ type: 'setMatchFormat', payload: value }),
    setLocation: (value: {
      locationType: LocationType;
      courtId: string | null;
      courtName: string;
      district: string | null;
    }) => dispatch({ type: 'setLocation', payload: value }),
    setScore: (value: MatchScore) => dispatch({ type: 'setScore', payload: value }),
    setResult: (value: MatchResult) => dispatch({ type: 'setResult', payload: value }),
    setCourtSurface: (value: CourtSurface | '') =>
      dispatch({ type: 'setCourtSurface', payload: value }),
    setOpponentName: (value: string) => dispatch({ type: 'setOpponentName', payload: value }),
    setOpponentLevel: (value: string) => dispatch({ type: 'setOpponentLevel', payload: value }),
    setDurationMinutes: (value: string) =>
      dispatch({ type: 'setDurationMinutes', payload: value }),
    setCost: (value: string) => dispatch({ type: 'setCost', payload: value }),
    setNotes: (value: string) => dispatch({ type: 'setNotes', payload: value }),
    handleUploadProgressChange,
    handleErrorChange,
  };
}
