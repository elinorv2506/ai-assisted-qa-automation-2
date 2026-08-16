/** Curated invalid program names for negative validation specs — static, reviewable sets. */
export const INVALID_PROGRAM_NAMES = {
  empty: '',
  whitespaceOnly: '   ',
  tabsAndNewlines: '\t\n',
} as const;

export type InvalidProgramNameKey = keyof typeof INVALID_PROGRAM_NAMES;
