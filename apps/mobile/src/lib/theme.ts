// Job Tracker mobile theme — same design language as the web app (near-black,
// glassy cards and soft green glows shared with the desktop redesign.

import { STATUS_COLORS, WORK_MODE_COLORS } from '@jobtracker/shared';

export const colors = {
  background: '#07100f',
  backgroundAlt: '#091412',

  card: 'rgba(14, 27, 24, 0.82)',
  cardSolid: '#0e1b18',
  cardBorder: '#1d322d',

  primary: '#75c9a4',
  primaryDim: 'rgba(117, 201, 164, 0.14)',
  primaryBorder: 'rgba(117, 201, 164, 0.34)',
  onPrimary: '#092019',

  accent: '#9adbbd',
  accentDim: 'rgba(154, 219, 189, 0.14)',

  text: '#f0f7f4',
  textMuted: '#9aa9a5',
  textFaint: '#657873',

  danger: '#fb7185',
  dangerDim: 'rgba(251, 113, 133, 0.12)',

  tabBar: '#0a1513',
  tabBarBorder: '#1a2d29',
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  full: 999,
} as const;

/** 4pt spacing grid: sp(4) = 16. */
export const sp = (n: number) => n * 4;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const statusColors: Record<string, string> = STATUS_COLORS;
export const workModeColors: Record<string, string> = WORK_MODE_COLORS;

/** Translucent chip colors derived from a hex status color. */
export function chipColors(hex: string) {
  return {
    backgroundColor: `${hex}26`, // ~15% alpha
    borderColor: `${hex}4d`, // ~30% alpha
    color: hex,
  };
}
