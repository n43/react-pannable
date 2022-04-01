import { XY, Rect } from '../interfaces';

export function getItemVisibleRect(rect: Rect, vRect: Rect): Rect {
  function calculate(x: XY) {
    const width = x === 'x' ? 'width' : 'height';

    return { [x]: vRect[x] - rect[x], [width]: vRect[width] };
  }

  const { x, width } = calculate('x');
  const { y, height } = calculate('y');

  return { x, y, width, height };
}

export function needsRender(rect: Rect, vRect: Rect): boolean {
  if (!vRect) {
    return true;
  }

  function calculate(x: XY) {
    const width = x === 'x' ? 'width' : 'height';

    return (
      vRect[x] - vRect[width] / 4 <= rect[x] + rect[width] &&
      rect[x] <= vRect[x] + (vRect[width] * 5) / 4
    );
  }

  return calculate('x') && calculate('y');
}
