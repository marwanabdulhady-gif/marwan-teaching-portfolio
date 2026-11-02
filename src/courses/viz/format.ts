/**
 * Number formatting for the explorers: a proper minus sign, no trailing
 * zeros, and infinities instead of "Infinity".
 */
export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '−∞';
  const factor = Math.pow(10, digits);
  const rounded = Math.round(value * factor) / factor;
  const text = Math.abs(rounded) < 1e-12 ? '0' : rounded.toFixed(digits).replace(/\.?0+$/, '');
  return text.replace('-', '−');
}

/** Prepend an explicit + for positive values (useful in formulas). */
export function signed(value: number, digits = 2): string {
  return value > 0 ? `+ ${fmt(value, digits)}` : `− ${fmt(Math.abs(value), digits)}`;
}

/** `x^2` style exponent with Unicode superscripts for small integers. */
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
export function superscript(n: number): string {
  return String(n)
    .split('')
    .map((digit) => SUP[Number(digit)] ?? digit)
    .join('');
}
