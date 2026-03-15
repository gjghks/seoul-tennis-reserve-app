'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import { DISTRICTS } from '@/lib/constants/districts';
import { MATCH_TYPE_OPTIONS } from '@/lib/constants/tennis';
import { MATCH_SKILL_FILTER_OPTIONS, PARTICIPANTS_OPTIONS } from '@/lib/constants/matching';

export default function MatchingPostForm() {
  const themeClass = useThemeClass();
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [playDate, setPlayDate] = useState(new Date().toISOString().split('T')[0]);
  const [playTimeStart, setPlayTimeStart] = useState('09:00');
  const [playTimeEnd, setPlayTimeEnd] = useState('11:00');
  const [district, setDistrict] = useState(DISTRICTS[0].nameKo);
  const [courtName, setCourtName] = useState('');
  const [matchType, setMatchType] = useState<string>(MATCH_TYPE_OPTIONS[0].value);
  const [skillLevel, setSkillLevel] = useState<string>(MATCH_SKILL_FILTER_OPTIONS[3].value);
  const [ntrpMin, setNtrpMin] = useState('');
  const [ntrpMax, setNtrpMax] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('1');
  const [costPerPerson, setCostPerPerson] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [contactType, setContactType] = useState<string>('');
  const [contactInfo, setContactInfo] = useState('');

  const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hours}:${minutes}`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !playDate || !courtName.trim() || !contactType || !contactInfo.trim()) {
      showToast('필수 항목을 모두 입력해주세요. (연락처 포함)', 'error');
      return;
    }

    if (ntrpMin && ntrpMax && Number(ntrpMin) > Number(ntrpMax)) {
      showToast('NTRP 최소값은 최대값보다 클 수 없습니다.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        play_date: playDate,
        play_time_start: `${playTimeStart}:00`,
        play_time_end: playTimeEnd ? `${playTimeEnd}:00` : null,
        location_type: 'custom',
        court_name: courtName.trim(),
        district,
        match_type: matchType,
        skill_level: skillLevel === 'any' ? null : skillLevel,
        ntrp_min: ntrpMin ? Number(ntrpMin) : null,
        ntrp_max: ntrpMax ? Number(ntrpMax) : null,
        max_participants: Number(maxParticipants),
        cost_per_person: isFree ? 0 : (costPerPerson ? Number(costPerPerson) : null),
        contact_type: contactType || null,
        contact_info: contactInfo.trim() || null,
      };

      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('모집글 등록에 실패했습니다.');

      const data = await res.json();
      showToast('매칭 모집글이 등록되었습니다.', 'success');
      router.push(`/matching/${data.post.id}`);
      
    } catch (err) {
      showToast((err as Error).message, 'error');
      setIsSubmitting(false);
    }
  };

  const inputClass = cn(
    'w-full px-4 py-3 outline-none transition-all',
    themeClass(
      'bg-white border-2 border-black rounded-[5px] font-bold text-black focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]',
      'bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500'
    )
  );

  const labelClass = cn('block mb-2 text-sm', themeClass('font-black text-black', 'font-bold text-gray-700'));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cn(
        'p-6 space-y-6',
        themeClass(
          'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
          'bg-white rounded-2xl border border-gray-100 shadow-sm'
        )
      )}>
        <div>
          <label htmlFor="title" className={labelClass}>제목 <span className="text-red-500">*</span></label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 이번주 토요일 오전에 같이 치실 분 구합니다"
            className={inputClass}
            required
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="playDate" className={labelClass}>날짜 <span className="text-red-500">*</span></label>
            <input
              id="playDate"
              type="date"
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={inputClass}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="playTimeStart" className={labelClass}>시작 시간 <span className="text-red-500">*</span></label>
              <select id="playTimeStart" value={playTimeStart} onChange={(e) => setPlayTimeStart(e.target.value)} className={inputClass} required>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="playTimeEnd" className={labelClass}>종료 시간</label>
              <select id="playTimeEnd" value={playTimeEnd} onChange={(e) => setPlayTimeEnd(e.target.value)} className={inputClass}>
                <option value="">선택 안함</option>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="district" className={labelClass}>지역 <span className="text-red-500">*</span></label>
            <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass} required>
              {DISTRICTS.map(d => <option key={d.slug} value={d.nameKo}>{d.nameKo}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="courtName" className={labelClass}>테니스장 이름 <span className="text-red-500">*</span></label>
            <input
              id="courtName"
              type="text"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              placeholder="예: 올림픽공원 테니스장"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="matchType" className={labelClass}>경기 방식 <span className="text-red-500">*</span></label>
            <select id="matchType" value={matchType} onChange={(e) => setMatchType(e.target.value)} className={inputClass} required>
              {MATCH_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maxParticipants" className={labelClass}>모집 인원 <span className="text-red-500">*</span></label>
            <select id="maxParticipants" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} className={inputClass} required>
              {PARTICIPANTS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="skillLevel" className={labelClass}>희망 실력 (선택)</label>
            <select id="skillLevel" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className={inputClass}>
              {MATCH_SKILL_FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ntrpMin" className={labelClass}>NTRP 범위 (선택)</label>
            <div className="flex items-center gap-2">
              <input
                id="ntrpMin"
                type="number"
                step="0.5"
                min="1.0"
                max="7.0"
                value={ntrpMin}
                onChange={(e) => setNtrpMin(e.target.value)}
                placeholder="최소"
                className={inputClass}
              />
              <span className="font-bold">~</span>
              <input
                id="ntrpMax"
                type="number"
                step="0.5"
                min="1.0"
                max="7.0"
                value={ntrpMax}
                onChange={(e) => setNtrpMax(e.target.value)}
                placeholder="최대"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="costPerPerson" className={labelClass}>1인당 비용</label>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => { setIsFree(e.target.checked); if (e.target.checked) setCostPerPerson(''); }}
              className={cn('w-4 h-4 rounded', themeClass('border-2 border-black text-black focus:ring-0 checked:bg-black', 'border-gray-300 text-green-600'))}
            />
            <span className={cn('text-sm', themeClass('font-bold text-black', 'font-medium text-gray-700'))}>무료</span>
          </label>
          {!isFree && (
            <div className="relative">
              <input
                id="costPerPerson"
                type="number"
                min="0"
                step="1000"
                value={costPerPerson}
                onChange={(e) => setCostPerPerson(e.target.value)}
                placeholder="예: 10000"
                className={inputClass}
              />
              <span className={cn('absolute right-4 top-3', themeClass('font-black text-black', 'font-bold text-gray-500'))}>원</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="contactType" className={labelClass}>연락처 <span className="text-red-500">*</span></label>
          <p className={cn('text-xs mb-2', themeClass('text-black/50 font-bold', 'text-gray-400'))}>
            수락된 신청자에게만 공개됩니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              id="contactType"
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              className={inputClass}
            >
              <option value="">연락 방법 선택 (필수)</option>
              <option value="kakao">카카오톡 ID</option>
              <option value="phone">전화번호</option>
            </select>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={contactType === 'kakao' ? '카카오톡 ID' : contactType === 'phone' ? '010-0000-0000' : '연락 방법을 먼저 선택해주세요'}
              disabled={!contactType}
              className={cn(inputClass, !contactType && 'opacity-50 cursor-not-allowed')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>상세 설명</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="추가적인 설명이나 조건을 적어주세요. (연락처, 계좌 등 개인정보는 위 연락처 필드를 이용해주세요)"
            className={cn(inputClass, 'min-h-[120px] resize-y')}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            'flex-1 py-4 text-center transition-all',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] uppercase',
              'bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 shadow-sm'
            )
          )}
        >
          취소
        </button>
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
          {isSubmitting ? '등록 중...' : '모집글 등록하기'}
        </button>
      </div>
    </form>
  );
}
