import { Size } from '../interfaces';

export function isEqualToSize(
  s1: Size | undefined | null,
  s2: Size | undefined | null
): boolean {
  if (!s1 || !s2) {
    return false;
  }
  if (s1 === s2) {
    return true;
  }
  if (s1.width !== s2.width || s1.height !== s2.height) {
    return false;
  }

  return true;
}
