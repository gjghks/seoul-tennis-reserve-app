import { useTheme } from '@/contexts/ThemeContext';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function useThemeClass() {
  const { isNeoBrutalism } = useTheme();

  return function themeClass<T>(neoBrutalValue: T, defaultValue: T) {
    return isNeoBrutalism ? neoBrutalValue : defaultValue;
  };
}
