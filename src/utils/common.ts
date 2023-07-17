/** UUID generator */
export function uuid () {
  const s: string[] = [];
  const hexDigits = '0123456789abcdef'.split('');
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits[Math.floor(Math.random() * 0x10)];
  }
  // bits 12-15 of the time_hi_and_version field to 0010
  s[14] = '4';
  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[19] = hexDigits[(s[19] as any & 0x3) | 0x8];
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
}