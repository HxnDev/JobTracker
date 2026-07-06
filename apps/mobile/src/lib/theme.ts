// Job Tracker mobile theme — same design language as the web app (near-black,
// glassy cards, soft glows) but its own identity: deep cyan-teal primary with
// a violet accent (the web app is indigo/emerald).

import { STATUS_COLORS, WORK_MODE_COLORS } from '@jobtracker/shared';

export const colors = {
  background: '#04090b',
  backgroundAlt: '#071114',

  card: 'rgba(11, 21, 25, 0.72)',
  cardSolid: '#0b1519',
  cardBorder: '#14262c',

  primary: '#2dd4bf',
  primaryDim: 'rgba(45, 212, 191, 0.14)',
  primaryBorder: 'rgba(45, 212, 191, 0.32)',
  onPrimary: '#03211d',

  accent: '#a78bfa',
  accentDim: 'rgba(167, 139, 250, 0.14)',

  text: '#eef6f5',
  textMuted: '#7e9691',
  textFaint: '#546965',

  danger: '#fb7185',
  dangerDim: 'rgba(251, 113, 133, 0.12)',

  tabBar: '#081014',
  tabBarBorder: '#122228',
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
