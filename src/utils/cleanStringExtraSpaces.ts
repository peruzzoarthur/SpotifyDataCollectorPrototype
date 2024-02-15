export const cleanStringExtraSpaces = (s: string): string => {
  return s
    .split(/\s+/)
    .filter((string) => string !== '')
    .join(' ');
};
