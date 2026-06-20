'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useMode } from '@/contexts/ModeContext';
import { useSeason } from '@/contexts/SeasonalContext';
import { type Mode, MODE_ORDER } from '@/lib/utils/appearanceMode';
import { type Season, SEASON_ORDER } from '@/lib/utils/season';

const MODE_META: Record<Mode, { label: string; icon: string }> = {
  system: { label: '시스템', icon: '🖥️' },
  light: { label: '라이트', icon: '☀️' },
  dark: { label: '다크', icon: '🌙' },
};

const SEASON_META: Record<Season, { label: string; icon: string }> = {
  'default': { label: '기본', icon: '✨' },
  'cherry-blossom': { label: '벚꽃', icon: '🌸' },
  'tennis-spring': { label: '봄', icon: '🎾' },
  'tennis-summer': { label: '여름', icon: '🌊' },
  'tennis-autumn': { label: '가을', icon: '🍂' },
  'tennis-winter': { label: '겨울', icon: '❄️' },
};

const SEG_BASE =
  'min-h-[40px] px-2.5 inline-flex items-center justify-center gap-1 text-xs font-medium rounded-lg border transition-colors';
const SEG_ON =
  'bg-green-600 text-white border-green-600 dark:bg-green-500 dark:border-green-500';
const SEG_OFF =
  'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold mb-1.5 text-gray-500 dark:text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export default function AppearanceControls() {
  const { isNeoBrutalism, toggleTheme } = useTheme();
  const { mode, setMode } = useMode();
  const { season, isAutoSeason, setSeasonOverride, setSeasonAuto } = useSeason();

  return (
    <div className="space-y-3">
      <Group title="모드">
        {MODE_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`flex-1 ${SEG_BASE} ${mode === m ? SEG_ON : SEG_OFF}`}
          >
            <span aria-hidden="true">{MODE_META[m].icon}</span>
            {MODE_META[m].label}
          </button>
        ))}
      </Group>

      <Group title="테마">
        {([
          { key: 'neo', label: 'Neo-Brutal', on: isNeoBrutalism },
          { key: 'min', label: 'Minimal', on: !isNeoBrutalism },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { if (!t.on) toggleTheme(); }}
            aria-pressed={t.on}
            className={`flex-1 ${SEG_BASE} ${t.on ? SEG_ON : SEG_OFF}`}
          >
            🎨 {t.label}
          </button>
        ))}
      </Group>

      <Group title="시즌">
        <button
          type="button"
          onClick={setSeasonAuto}
          aria-pressed={isAutoSeason}
          className={`${SEG_BASE} ${isAutoSeason ? SEG_ON : SEG_OFF}`}
        >
          ⏱️ 자동
        </button>
        {SEASON_ORDER.map((s) => {
          const on = !isAutoSeason && season === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSeasonOverride(s)}
              aria-pressed={on}
              className={`${SEG_BASE} ${on ? SEG_ON : SEG_OFF}`}
            >
              <span aria-hidden="true">{SEASON_META[s].icon}</span>
              {SEASON_META[s].label}
            </button>
          );
        })}
      </Group>

      <p className="text-[11px] leading-snug text-gray-400 dark:text-slate-500">
        시즌 ‘자동’은 날짜에 따라 테마가 자동으로 바뀝니다. 모드·테마·시즌 설정은 이 기기에 저장됩니다.
      </p>
    </div>
  );
}
