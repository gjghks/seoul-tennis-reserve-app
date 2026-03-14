'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass, cn } from '@/lib/cn';

interface TournamentLifecycleDemoProps {
  compact?: boolean;
  autoPlay?: boolean;
}

const PHASE_LABELS = ['생성', '추첨', '경기', '우승', '공유'] as const;
const PHASE_ICONS = ['①', '②', '③', '④', '⑤'] as const;
const PHASE_DESCRIPTIONS = [
  '대회 정보를 입력하고 새 토너먼트를 만듭니다',
  '참가자를 등록하고 대진표를 자동 추첨합니다',
  '경기를 진행하고 실시간으로 스코어를 기록합니다',
  '우승자가 결정되고 결과가 확정됩니다',
  '완성된 대진표를 카카오톡이나 링크로 공유합니다',
] as const;

const PHASE_DURATION = 5000;

const SVG_STYLE = `
@keyframes demo-type { from { width: 0; } to { width: 100%; } }
@keyframes demo-shuffle { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes demo-confetti { 0% { opacity: 1; transform: scale(1) translate(0,0); } 100% { opacity: 0; transform: scale(0) translate(var(--tx), var(--ty)); } }
@keyframes demo-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes demo-slide-left { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
@keyframes demo-slide-right { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
@keyframes demo-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes demo-score-pop { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
@keyframes demo-glow-line {
  from { stroke-dashoffset: var(--path-len, 200); }
  to { stroke-dashoffset: 0; }
}
@keyframes demo-glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 3px #ef4444); }
  50% { filter: drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 18px #fbbf24); }
}
@keyframes demo-particle {
  0% { opacity: 1; r: 3; }
  100% { opacity: 0; r: 0; cx: var(--ex); cy: var(--ey); }
}
`;

const PARTICIPANTS = ['김철수', '이영희', '박민수', '최지은'] as const;

const BRACKET_SKELETON = [
  { id: 's1-h1', x1: 30, y1: 50, x2: 90, y2: 50 },
  { id: 's1-h2', x1: 30, y1: 100, x2: 90, y2: 100 },
  { id: 's1-v', x1: 90, y1: 50, x2: 90, y2: 100 },
  { id: 's1-out', x1: 90, y1: 75, x2: 140, y2: 75 },
  { id: 's2-h1', x1: 30, y1: 170, x2: 90, y2: 170 },
  { id: 's2-h2', x1: 30, y1: 220, x2: 90, y2: 220 },
  { id: 's2-v', x1: 90, y1: 170, x2: 90, y2: 220 },
  { id: 's2-out', x1: 90, y1: 195, x2: 140, y2: 195 },
  { id: 'f-v', x1: 220, y1: 75, x2: 220, y2: 195 },
  { id: 'f-out', x1: 220, y1: 135, x2: 270, y2: 135 },
];

const WINNER_PATH = [
  { id: 'w-s1top', x1: 30, y1: 50, x2: 90, y2: 50 },
  { id: 'w-s1v', x1: 90, y1: 50, x2: 90, y2: 75 },
  { id: 'w-s1out', x1: 90, y1: 75, x2: 140, y2: 75 },
  { id: 'w-fv', x1: 220, y1: 75, x2: 220, y2: 135 },
  { id: 'w-fout', x1: 220, y1: 135, x2: 270, y2: 135 },
];

const CONFETTI_PARTICLES = [
  { id: 'p-tl', tx: -30, ty: -40, color: '#ef4444' },
  { id: 'p-tr', tx: 25, ty: -45, color: '#facc15' },
  { id: 'p-mr', tx: 40, ty: -15, color: '#22c55e' },
  { id: 'p-ml', tx: -35, ty: -10, color: '#3b82f6' },
  { id: 'p-tc', tx: 15, ty: -50, color: '#f97316' },
  { id: 'p-bl', tx: -20, ty: -30, color: '#a855f7' },
];

const SHARE_BRACKET_LINES = [
  { id: 'sh-s1h1', x1: 130, y1: 80, x2: 170, y2: 80 },
  { id: 'sh-s1h2', x1: 130, y1: 110, x2: 170, y2: 110 },
  { id: 'sh-s1v', x1: 170, y1: 80, x2: 170, y2: 110 },
  { id: 'sh-s1out', x1: 170, y1: 95, x2: 210, y2: 95 },
  { id: 'sh-s2h1', x1: 130, y1: 145, x2: 170, y2: 145 },
  { id: 'sh-s2h2', x1: 130, y1: 175, x2: 170, y2: 175 },
  { id: 'sh-s2v', x1: 170, y1: 145, x2: 170, y2: 175 },
  { id: 'sh-s2out', x1: 170, y1: 160, x2: 210, y2: 160 },
  { id: 'sh-fv', x1: 260, y1: 95, x2: 260, y2: 160 },
  { id: 'sh-fout', x1: 260, y1: 127, x2: 290, y2: 127 },
];

function PhaseCreate({ compact, isNeo }: { compact: boolean; isNeo: boolean }) {
  const s = 1;
  const fields = [
    { label: '대회명', value: '3월 월례대회', delay: 0 },
    { label: '방식', value: '싱글 엘리미네이션', delay: 0.3, badge: true },
    { label: '종목', value: '남복', delay: 0.6, badge: true },
    { label: '스코어', value: '4게임 노애드', delay: 0.9, badge: true },
  ];

  const borderColor = isNeo ? '#000' : '#d1d5db';
  const bgCard = isNeo ? '#fff' : '#f9fafb';
  const textColor = isNeo ? '#000' : '#374151';
  const labelColor = isNeo ? '#000' : '#6b7280';
  const badgeBg = isNeo ? '#000' : '#f3f4f6';
  const badgeText = isNeo ? '#fff' : '#374151';

  return (
    <g>
      <rect
        x={50 * s} y={20 * s}
        width={400 * s} height={240 * s}
        rx={isNeo ? 5 : 12}
        fill={bgCard}
        stroke={borderColor}
        strokeWidth={isNeo ? 2 : 1}
        className="bracket-match-card"
        style={{ '--card-delay': '0s' } as React.CSSProperties}
      />

      <text
        x={74 * s} y={50 * s}
        fontSize={compact ? 11 : 14}
        fontWeight={isNeo ? 900 : 700}
        fill={textColor}
        className="bracket-match-card"
        style={{ '--card-delay': '0.1s' } as React.CSSProperties}
      >
        📋 새 토너먼트
      </text>

      {fields.map((field) => {
        const fieldIndex = fields.indexOf(field);
        const yBase = 75 + fieldIndex * 45;
        return (
          <g
            key={field.label}
            className="bracket-match-card"
            style={{ '--card-delay': `${field.delay}s` } as React.CSSProperties}
          >
            <text
              x={74 * s} y={yBase * s}
              fontSize={compact ? 8 : 10}
              fontWeight={600}
              fill={labelColor}
            >
              {field.label}
            </text>

            {field.badge ? (
              <g>
                <rect
                  x={74 * s} y={(yBase + 4) * s}
                  width={(field.value.length * (compact ? 8 : 11) + 16) * s}
                  height={22 * s}
                  rx={isNeo ? 3 : 6}
                  fill={badgeBg}
                  stroke={isNeo ? '#000' : '#e5e7eb'}
                  strokeWidth={isNeo ? 1.5 : 0.5}
                />
                <text
                  x={(74 + 8) * s} y={(yBase + 18) * s}
                  fontSize={compact ? 9 : 11}
                  fontWeight={isNeo ? 800 : 600}
                  fill={badgeText}
                >
                  {field.value}
                </text>
              </g>
            ) : (
              <g>
                <rect
                  x={74 * s} y={(yBase + 4) * s}
                  width={300 * s} height={24 * s}
                  rx={isNeo ? 3 : 6}
                  fill="transparent"
                  stroke={borderColor}
                  strokeWidth={isNeo ? 1.5 : 1}
                />
                <text
                  x={(74 + 8) * s} y={(yBase + 20) * s}
                  fontSize={compact ? 10 : 12}
                  fontWeight={isNeo ? 800 : 500}
                  fill={textColor}
                >
                  {field.value}
                </text>
                <rect
                  x={(74 + 8 + field.value.length * (compact ? 7 : 8.5)) * s}
                  y={(yBase + 7) * s}
                  width={1.5 * s} height={16 * s}
                  fill={isNeo ? '#000' : '#22c55e'}
                  opacity={0.8}
                >
                  <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                </rect>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function PhaseDraw({ compact, isNeo }: { compact: boolean; isNeo: boolean }) {
  const s = 1;
  const bracketY = [40, 100, 160, 220];
  const borderColor = isNeo ? '#000' : '#d1d5db';
  const textColor = isNeo ? '#000' : '#374151';
  const cardBg = isNeo ? '#fff' : '#f9fafb';
  const connectorColor = isNeo ? '#000' : '#9ca3af';

  const semiSlotYs = [
    { id: 'semi-top', y: (bracketY[0] + bracketY[1]) / 2 },
    { id: 'semi-bottom', y: (bracketY[2] + bracketY[3]) / 2 },
  ];

  return (
    <g>
      {PARTICIPANTS.map((name, idx) => (
        <g
          key={name}
          style={{
            animation: `demo-shuffle 0.5s cubic-bezier(0.22,1,0.36,1) ${idx * 0.2}s both`,
          }}
        >
          <rect
            x={30 * s} y={bracketY[idx] * s}
            width={120 * s} height={36 * s}
            rx={isNeo ? 4 : 8}
            fill={cardBg}
            stroke={borderColor}
            strokeWidth={isNeo ? 2 : 1}
          />
          <text
            x={42 * s} y={(bracketY[idx] + 22) * s}
            fontSize={compact ? 7 : 9}
            fontWeight={700}
            fill={isNeo ? '#000' : '#9ca3af'}
          >
            [{idx + 1}]
          </text>
          <text
            x={(42 + 22) * s} y={(bracketY[idx] + 22) * s}
            fontSize={compact ? 10 : 12}
            fontWeight={isNeo ? 800 : 600}
            fill={textColor}
          >
            {name}
          </text>
        </g>
      ))}

      <line
        x1={150 * s} y1={(bracketY[0] + 18) * s}
        x2={200 * s} y2={(bracketY[0] + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={50 * s}
        strokeDashoffset={50 * s}
        style={{
          animation: `demo-glow-line 0.5s cubic-bezier(0.22,1,0.36,1) 0.8s forwards`,
          ['--path-len' as string]: `${50 * s}`,
        }}
      />
      <line
        x1={150 * s} y1={(bracketY[1] + 18) * s}
        x2={200 * s} y2={(bracketY[1] + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={50 * s}
        strokeDashoffset={50 * s}
        style={{
          animation: `demo-glow-line 0.5s cubic-bezier(0.22,1,0.36,1) 0.9s forwards`,
          ['--path-len' as string]: `${50 * s}`,
        }}
      />
      <line
        x1={200 * s} y1={(bracketY[0] + 18) * s}
        x2={200 * s} y2={(bracketY[1] + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={(bracketY[1] - bracketY[0]) * s}
        strokeDashoffset={(bracketY[1] - bracketY[0]) * s}
        style={{
          animation: `demo-glow-line 0.4s cubic-bezier(0.22,1,0.36,1) 1.0s forwards`,
          ['--path-len' as string]: `${(bracketY[1] - bracketY[0]) * s}`,
        }}
      />
      <line
        x1={200 * s} y1={((bracketY[0] + bracketY[1]) / 2 + 18) * s}
        x2={250 * s} y2={((bracketY[0] + bracketY[1]) / 2 + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={50 * s}
        strokeDashoffset={50 * s}
        style={{
          animation: `demo-glow-line 0.4s cubic-bezier(0.22,1,0.36,1) 1.1s forwards`,
          ['--path-len' as string]: `${50 * s}`,
        }}
      />

      <line
        x1={150 * s} y1={(bracketY[2] + 18) * s}
        x2={200 * s} y2={(bracketY[2] + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={50 * s}
        strokeDashoffset={50 * s}
        style={{
          animation: `demo-glow-line 0.5s cubic-bezier(0.22,1,0.36,1) 1.2s forwards`,
          ['--path-len' as string]: `${50 * s}`,
        }}
      />
      <line
        x1={150 * s} y1={(bracketY[3] + 18) * s}
        x2={200 * s} y2={(bracketY[3] + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={50 * s}
        strokeDashoffset={50 * s}
        style={{
          animation: `demo-glow-line 0.5s cubic-bezier(0.22,1,0.36,1) 1.3s forwards`,
          ['--path-len' as string]: `${50 * s}`,
        }}
      />
      <line
        x1={200 * s} y1={(bracketY[2] + 18) * s}
        x2={200 * s} y2={(bracketY[3] + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={(bracketY[3] - bracketY[2]) * s}
        strokeDashoffset={(bracketY[3] - bracketY[2]) * s}
        style={{
          animation: `demo-glow-line 0.4s cubic-bezier(0.22,1,0.36,1) 1.4s forwards`,
          ['--path-len' as string]: `${(bracketY[3] - bracketY[2]) * s}`,
        }}
      />
      <line
        x1={200 * s} y1={((bracketY[2] + bracketY[3]) / 2 + 18) * s}
        x2={250 * s} y2={((bracketY[2] + bracketY[3]) / 2 + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={50 * s}
        strokeDashoffset={50 * s}
        style={{
          animation: `demo-glow-line 0.4s cubic-bezier(0.22,1,0.36,1) 1.5s forwards`,
          ['--path-len' as string]: `${50 * s}`,
        }}
      />

      {semiSlotYs.map((slot, slotIdx) => (
        <rect
          key={slot.id}
          x={250 * s} y={(slot.y + 4) * s}
          width={100 * s} height={28 * s}
          rx={isNeo ? 3 : 6}
          fill="transparent"
          stroke={connectorColor}
          strokeWidth={isNeo ? 1.5 : 1}
          strokeDasharray="4 3"
          opacity={0}
          style={{
            animation: `demo-fade-in 0.4s ease ${1.6 + slotIdx * 0.15}s forwards`,
          }}
        />
      ))}

      <line
        x1={350 * s} y1={((bracketY[0] + bracketY[1]) / 2 + 18) * s}
        x2={350 * s} y2={((bracketY[2] + bracketY[3]) / 2 + 18) * s}
        stroke={connectorColor}
        strokeWidth={isNeo ? 2 : 1.5}
        strokeDasharray={((bracketY[2] + bracketY[3]) / 2 - (bracketY[0] + bracketY[1]) / 2) * s}
        strokeDashoffset={((bracketY[2] + bracketY[3]) / 2 - (bracketY[0] + bracketY[1]) / 2) * s}
        style={{
          animation: `demo-glow-line 0.5s cubic-bezier(0.22,1,0.36,1) 1.9s forwards`,
          ['--path-len' as string]: `${((bracketY[2] + bracketY[3]) / 2 - (bracketY[0] + bracketY[1]) / 2) * s}`,
        }}
      />
    </g>
  );
}

function PhaseMatch({ compact, isNeo }: { compact: boolean; isNeo: boolean }) {
  const s = 1;
  const borderColor = isNeo ? '#000' : '#d1d5db';
  const textColor = isNeo ? '#000' : '#374151';
  const cardBg = isNeo ? '#fff' : '#f9fafb';
  const winBg = isNeo ? '#dcfce7' : '#f0fdf4';
  const winColor = '#22c55e';
  const dimColor = isNeo ? 'rgba(0,0,0,0.4)' : '#9ca3af';
  const connectorColor = isNeo ? '#000' : '#9ca3af';

  const semiMatches = [
    { id: 'semi-1', p1: '김철수', p2: '이영희', score: '4-2', y: 30, delay: 0 },
    { id: 'semi-2', p1: '박민수', p2: '최지은', score: '4-1', y: 115, delay: 1.0 },
  ];

  const finalMatch = { p1: '김철수', p2: '박민수', score: '4-3', y: 70, delay: 2.0 };

  return (
    <g>
      {semiMatches.map((m) => (
        <g key={m.id}>
          <rect
            x={20 * s} y={m.y * s}
            width={140 * s} height={56 * s}
            rx={isNeo ? 4 : 8}
            fill={cardBg}
            stroke={borderColor}
            strokeWidth={isNeo ? 2 : 1}
            className="bracket-match-card"
            style={{ '--card-delay': `${m.delay * 0.3}s` } as React.CSSProperties}
          />

          <rect
            x={20 * s} y={m.y * s}
            width={140 * s} height={28 * s}
            rx={0}
            fill={winBg}
            opacity={0}
            style={{
              animation: `demo-fade-in 0.3s ease ${m.delay + 0.5}s forwards`,
            }}
          />
          <text
            x={30 * s} y={(m.y + 18) * s}
            fontSize={compact ? 9 : 11}
            fontWeight={isNeo ? 800 : 600}
            fill={textColor}
          >
            {m.p1}
          </text>

          <line
            x1={20 * s} y1={(m.y + 28) * s}
            x2={160 * s} y2={(m.y + 28) * s}
            stroke={isNeo ? 'rgba(0,0,0,0.15)' : '#f3f4f6'}
            strokeWidth={1}
          />
          <text
            x={30 * s} y={(m.y + 46) * s}
            fontSize={compact ? 9 : 11}
            fontWeight={isNeo ? 600 : 400}
            fill={dimColor}
            style={{
              animation: `demo-fade-in 0.3s ease ${m.delay + 0.5}s forwards`,
            }}
          >
            {m.p2}
          </text>

          <text
            x={140 * s} y={(m.y + 18) * s}
            fontSize={compact ? 9 : 11}
            fontWeight={800}
            fill={winColor}
            textAnchor="end"
            opacity={0}
            style={{
              animation: `demo-score-pop 0.3s cubic-bezier(0.22,1,0.36,1) ${m.delay + 0.5}s forwards`,
            }}
          >
            {m.score}
          </text>

          <text
            x={148 * s} y={(m.y + 18) * s}
            fontSize={compact ? 8 : 10}
            fill={winColor}
            opacity={0}
            style={{
              animation: `demo-fade-in 0.2s ease ${m.delay + 0.7}s forwards`,
            }}
          >
            ✓
          </text>

          <line
            x1={160 * s} y1={(m.y + 28) * s}
            x2={220 * s} y2={(finalMatch.y + 28) * s}
            stroke={connectorColor}
            strokeWidth={isNeo ? 2 : 1.5}
            strokeDasharray={100 * s}
            strokeDashoffset={100 * s}
            style={{
              animation: `demo-glow-line 0.4s cubic-bezier(0.22,1,0.36,1) ${m.delay + 0.8}s forwards`,
              ['--path-len' as string]: `${100 * s}`,
            }}
          />
        </g>
      ))}

      <g>
        <rect
          x={220 * s} y={finalMatch.y * s}
          width={150 * s} height={56 * s}
          rx={isNeo ? 4 : 8}
          fill={cardBg}
          stroke={borderColor}
          strokeWidth={isNeo ? 2 : 1}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.4s ease ${finalMatch.delay}s forwards`,
          }}
        />

        <text
          x={295 * s} y={(finalMatch.y - 6) * s}
          fontSize={compact ? 8 : 10}
          fontWeight={isNeo ? 900 : 700}
          fill={isNeo ? '#000' : '#6b7280'}
          textAnchor="middle"
          opacity={0}
          style={{
            animation: `demo-fade-in 0.3s ease ${finalMatch.delay}s forwards`,
          }}
        >
          결승
        </text>

        <rect
          x={220 * s} y={finalMatch.y * s}
          width={150 * s} height={28 * s}
          rx={0}
          fill={winBg}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.3s ease ${finalMatch.delay + 0.5}s forwards`,
          }}
        />

        <text
          x={232 * s} y={(finalMatch.y + 18) * s}
          fontSize={compact ? 9 : 11}
          fontWeight={isNeo ? 800 : 600}
          fill={textColor}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.3s ease ${finalMatch.delay + 0.1}s forwards`,
          }}
        >
          {finalMatch.p1}
        </text>

        <line
          x1={220 * s} y1={(finalMatch.y + 28) * s}
          x2={370 * s} y2={(finalMatch.y + 28) * s}
          stroke={isNeo ? 'rgba(0,0,0,0.15)' : '#f3f4f6'}
          strokeWidth={1}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.2s ease ${finalMatch.delay + 0.1}s forwards`,
          }}
        />

        <text
          x={232 * s} y={(finalMatch.y + 46) * s}
          fontSize={compact ? 9 : 11}
          fontWeight={isNeo ? 600 : 400}
          fill={dimColor}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.3s ease ${finalMatch.delay + 0.1}s forwards`,
          }}
        >
          {finalMatch.p2}
        </text>

        <text
          x={350 * s} y={(finalMatch.y + 18) * s}
          fontSize={compact ? 9 : 11}
          fontWeight={800}
          fill={winColor}
          textAnchor="end"
          opacity={0}
          style={{
            animation: `demo-score-pop 0.3s cubic-bezier(0.22,1,0.36,1) ${finalMatch.delay + 0.5}s forwards`,
          }}
        >
          {finalMatch.score}
        </text>

        <text
          x={358 * s} y={(finalMatch.y + 18) * s}
          fontSize={compact ? 8 : 10}
          fill={winColor}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.2s ease ${finalMatch.delay + 0.7}s forwards`,
          }}
        >
          ✓
        </text>
      </g>

      <text
        x={90 * s} y={22 * s}
        fontSize={compact ? 8 : 10}
        fontWeight={isNeo ? 900 : 700}
        fill={isNeo ? '#000' : '#6b7280'}
        textAnchor="middle"
      >
        4강
      </text>
    </g>
  );
}

function PhaseChampion({ compact, isNeo }: { compact: boolean; isNeo: boolean }) {
  const s = 1;
  const textColor = isNeo ? '#000' : '#374151';
  const connectorColor = isNeo ? '#000' : '#9ca3af';
  const bracketNameYs = [50, 100, 170, 220];

  return (
    <g>
      {BRACKET_SKELETON.map((line) => (
        <line
          key={line.id}
          x1={line.x1 * s} y1={line.y1 * s}
          x2={line.x2 * s} y2={line.y2 * s}
          stroke={connectorColor}
          strokeWidth={isNeo ? 1.5 : 1}
          opacity={0.3}
        />
      ))}

      {PARTICIPANTS.map((name, idx) => (
        <text
          key={name}
          x={20 * s} y={(bracketNameYs[idx] + 4) * s}
          fontSize={compact ? 7 : 9}
          fontWeight={500}
          fill={connectorColor}
          textAnchor="end"
          opacity={0.5}
        >
          {name}
        </text>
      ))}

      <text
        x={150 * s} y={79 * s}
        fontSize={compact ? 8 : 10}
        fontWeight={700}
        fill={textColor}
        opacity={0.5}
      >
        김철수
      </text>
      <text
        x={150 * s} y={199 * s}
        fontSize={compact ? 8 : 10}
        fontWeight={700}
        fill={textColor}
        opacity={0.5}
      >
        박민수
      </text>

      {WINNER_PATH.map((line) => {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const segIndex = WINNER_PATH.indexOf(line);
        return (
          <line
            key={line.id}
            x1={line.x1 * s} y1={line.y1 * s}
            x2={line.x2 * s} y2={line.y2 * s}
            stroke="#ef4444"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={len * s}
            strokeDashoffset={len * s}
            style={{
              animation: `demo-glow-line 0.4s cubic-bezier(0.22,1,0.36,1) ${segIndex * 0.2}s forwards, demo-glow-pulse 1.5s ease-in-out ${0.2 * WINNER_PATH.length + 0.3}s infinite`,
              ['--path-len' as string]: `${len * s}`,
            }}
          />
        );
      })}

      <g
        style={{
          transformOrigin: `${340 * s}px ${135 * s}px`,
          animation: `champion-reveal 0.8s cubic-bezier(0.22,1,0.36,1) 1.2s both`,
        }}
      >
        <rect
          x={280 * s} y={105 * s}
          width={120 * s} height={60 * s}
          rx={isNeo ? 5 : 12}
          fill={isNeo ? '#facc15' : '#fefce8'}
          stroke={isNeo ? '#000' : '#fde047'}
          strokeWidth={isNeo ? 2.5 : 1.5}
        />
        <text
          x={340 * s} y={(105 + 26) * s}
          fontSize={compact ? 16 : 22}
          textAnchor="middle"
        >
          🏆
        </text>
        <text
          x={340 * s} y={(105 + 48) * s}
          fontSize={compact ? 11 : 14}
          fontWeight={isNeo ? 900 : 700}
          fill={textColor}
          textAnchor="middle"
        >
          김철수
        </text>
      </g>

      {CONFETTI_PARTICLES.map((p) => {
        const pIndex = CONFETTI_PARTICLES.indexOf(p);
        return (
          <circle
            key={p.id}
            cx={340 * s}
            cy={115 * s}
            r={3 * s}
            fill={p.color}
            style={{
              ['--ex' as string]: `${(340 + p.tx) * s}px`,
              ['--ey' as string]: `${(115 + p.ty) * s}px`,
              animation: `demo-confetti 1s ease-out ${1.5 + pIndex * 0.1}s both`,
              transformOrigin: `${340 * s}px ${115 * s}px`,
            }}
          />
        );
      })}
    </g>
  );
}

function PhaseShare({ compact, isNeo }: { compact: boolean; isNeo: boolean }) {
  const s = 1;
  const borderColor = isNeo ? '#000' : '#d1d5db';
  const textColor = isNeo ? '#000' : '#374151';
  const cardBg = isNeo ? '#fff' : '#f9fafb';
  const connectorColor = isNeo ? 'rgba(0,0,0,0.2)' : '#e5e7eb';
  const previewNameYs = [83, 113, 148, 178];

  return (
    <g>
      <rect
        x={100 * s} y={25 * s}
        width={300 * s} height={200 * s}
        rx={isNeo ? 5 : 12}
        fill={cardBg}
        stroke={borderColor}
        strokeWidth={isNeo ? 2 : 1}
        className="bracket-match-card"
        style={{ '--card-delay': '0s' } as React.CSSProperties}
      />

      <rect
        x={100 * s} y={25 * s}
        width={300 * s} height={36 * s}
        rx={0}
        fill={isNeo ? '#000' : '#f3f4f6'}
        opacity={0}
        style={{ animation: 'demo-fade-in 0.3s ease 0.2s forwards' }}
      />
      <text
        x={250 * s} y={48 * s}
        fontSize={compact ? 9 : 11}
        fontWeight={isNeo ? 900 : 700}
        fill={isNeo ? '#fff' : '#374151'}
        textAnchor="middle"
        opacity={0}
        style={{ animation: 'demo-fade-in 0.3s ease 0.3s forwards' }}
      >
        🏆 3월 월례대회 결과
      </text>

      {SHARE_BRACKET_LINES.map((line, lineIdx) => (
        <line
          key={line.id}
          x1={line.x1 * s} y1={line.y1 * s}
          x2={line.x2 * s} y2={line.y2 * s}
          stroke={connectorColor}
          strokeWidth={1.5}
          opacity={0}
          style={{
            animation: `demo-fade-in 0.3s ease ${0.4 + lineIdx * 0.04}s forwards`,
          }}
        />
      ))}

      <text
        x={300 * s} y={131 * s}
        fontSize={compact ? 8 : 10}
        fontWeight={800}
        fill="#ef4444"
        opacity={0}
        style={{ animation: 'demo-fade-in 0.3s ease 0.9s forwards' }}
      >
        🏆 김철수
      </text>

      {PARTICIPANTS.map((name, idx) => (
        <text
          key={`preview-${name}`}
          x={125 * s} y={previewNameYs[idx] * s}
          fontSize={compact ? 6 : 8}
          fontWeight={500}
          fill={textColor}
          textAnchor="end"
          opacity={0}
          style={{
            animation: `demo-fade-in 0.2s ease ${0.5 + idx * 0.05}s forwards`,
          }}
        >
          {name}
        </text>
      ))}

      <g
        style={{
          animation: 'demo-slide-left 0.5s cubic-bezier(0.22,1,0.36,1) 1.2s both',
        }}
      >
        <circle
          cx={160 * s} cy={255 * s}
          r={18 * s}
          fill="#FEE500"
          stroke={isNeo ? '#000' : '#FEE500'}
          strokeWidth={isNeo ? 2 : 0}
        />
        <text
          x={160 * s} y={260 * s}
          fontSize={compact ? 14 : 18}
          textAnchor="middle"
        >
          💬
        </text>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0,0; 0,${-4 * s}; 0,0`}
          dur="1.5s"
          repeatCount="indefinite"
          begin="1.8s"
        />
      </g>

      <g
        style={{
          animation: 'demo-slide-right 0.5s cubic-bezier(0.22,1,0.36,1) 1.4s both',
        }}
      >
        <circle
          cx={340 * s} cy={255 * s}
          r={18 * s}
          fill={isNeo ? '#000' : '#f3f4f6'}
          stroke={isNeo ? '#000' : '#d1d5db'}
          strokeWidth={isNeo ? 0 : 1}
        />
        <text
          x={340 * s} y={260 * s}
          fontSize={compact ? 14 : 18}
          textAnchor="middle"
        >
          🔗
        </text>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0,0; 0,${-4 * s}; 0,0`}
          dur="1.5s"
          repeatCount="indefinite"
          begin="2.0s"
        />
      </g>

      <text
        x={250 * s} y={260 * s}
        fontSize={compact ? 10 : 13}
        fontWeight={isNeo ? 900 : 700}
        fill={isNeo ? '#000' : '#22c55e'}
        textAnchor="middle"
        opacity={0}
        style={{
          animation: 'demo-fade-in 0.5s ease 2.0s forwards',
        }}
      >
        공유 완료 ✨
      </text>
    </g>
  );
}

export default function TournamentLifecycleDemo({
  compact = false,
  autoPlay = true,
}: TournamentLifecycleDemoProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay !== false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % 5);
    }, PHASE_DURATION);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleStepClick = useCallback((index: number) => {
    setCurrentPhase(index);
    setIsPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const viewBox = '0 0 500 280';
  const progressPct = ((currentPhase + 1) / 5) * 100;

  const phaseComponents = [
    <PhaseCreate key="create" compact={compact} isNeo={isNeoBrutalism} />,
    <PhaseDraw key="draw" compact={compact} isNeo={isNeoBrutalism} />,
    <PhaseMatch key="match" compact={compact} isNeo={isNeoBrutalism} />,
    <PhaseChampion key="champion" compact={compact} isNeo={isNeoBrutalism} />,
    <PhaseShare key="share" compact={compact} isNeo={isNeoBrutalism} />,
  ];

  return (
    <div className="w-full space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          {PHASE_LABELS.map((label, i) => {
            const isActive = i === currentPhase;
            const isPast = i < currentPhase;

            return (
              <button
                key={label}
                type="button"
                onClick={() => handleStepClick(i)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition-all',
                  isActive
                    ? themeClass(
                        'bg-black text-white shadow-[2px_2px_0px_0px_#000]',
                        'bg-green-600 text-white shadow-sm'
                      )
                    : isPast
                      ? themeClass(
                          'bg-gray-200 text-black/60',
                          'bg-green-50 text-green-700'
                        )
                      : themeClass(
                          'bg-gray-100 text-black/30',
                          'bg-gray-100 text-gray-400'
                        )
                )}
              >
                <span>{PHASE_ICONS[i]}</span>
                <span>{label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleTogglePlay}
            className={cn(
              'ml-1 flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all',
              themeClass(
                'border-2 border-black bg-white text-black hover:bg-black hover:text-white',
                'border border-gray-300 bg-white text-gray-500 hover:bg-gray-100'
              )
            )}
            aria-label={isPlaying ? '일시정지' : '재생'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>

        <div
          className={cn(
            'h-1.5 w-full overflow-hidden rounded-full',
            themeClass('border border-black bg-gray-200', 'bg-gray-100')
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              themeClass('bg-black', 'bg-green-500')
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div
        className={cn(
          'relative overflow-hidden',
          '',
          themeClass(
            'rounded-[5px] border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]',
            'rounded-xl border border-gray-200 bg-white shadow-sm'
          )
        )}
      >
        <svg
          width="100%"
          viewBox={viewBox}
          className={cn('block', compact ? 'max-h-[300px]' : '')}
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <title>토너먼트 라이프사이클 데모</title>
          <defs>
            <style>{SVG_STYLE}</style>
          </defs>

          <g key={currentPhase}>
            {phaseComponents[currentPhase]}
          </g>
        </svg>
      </div>

      {!compact && (
        <p
          className={cn(
            'text-center text-sm',
            themeClass('font-bold text-black/60', 'text-gray-500')
          )}
        >
          {PHASE_DESCRIPTIONS[currentPhase]}
        </p>
      )}
    </div>
  );
}
