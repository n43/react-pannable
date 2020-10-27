export type Size = { width: number; height: number };

export function isEqualToSize(
  s1: Size | undefined | null,
  s2: Size | undefined | null
) {
  if (!s1 || !s2) {
    return false;
  }

  if (s1 === s2) {
    return true;
  }
  if (s1.width === s2.width && s1.height === s2.height) {
    return true;
  }

  return false;
}

export function isNumber(n: number | null | undefined) {
  return n !== null && n !== undefined && !isNaN(n) && isFinite(n);
}
