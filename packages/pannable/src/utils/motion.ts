import {
  XY,
  WH,
  Point,
  Size,
  Rect,
  Align,
  Bound,
  Inset,
  LT,
  RB,
} from '../interfaces';

function getAcc(rate: number, vel: Point): Point {
  const r = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

  if (r === 0) {
    return { x: 0, y: 0 };
  }
  return { x: rate * (vel.x / r), y: rate * (vel.y / r) };
}

export function getAdjustedContentVelocity(velocity: Point): Point {
  function calculate(x: XY) {
    const maxVelocity = 2.5;
    return Math.max(-maxVelocity, Math.min(velocity[x], maxVelocity));
  }

  const adjustedVelocity: Point = {
    x: calculate('x'),
    y: calculate('y'),
  };
  if (adjustedVelocity.x === velocity.x && adjustedVelocity.y === velocity.y) {
    return velocity;
  }
  return adjustedVelocity;
}

export function getAdjustedContentOffset(
  offset: Point,
  size: Size,
  cSize: Size,
  cInset: Inset,
  bound: Record<XY, Bound>,
  paging: boolean
): Point {
  function calculate(x: XY) {
    const [width, left, right]: [WH, LT, RB] =
      x === 'x' ? ['width', 'left', 'right'] : ['height', 'top', 'bottom'];
    const sizeWidth = size[width];
    const offsetX = offset[x];

    if (bound[x] === -1) {
      return offsetX;
    }

    let minOffsetX = Math.min(
      sizeWidth - (cInset[left] + cSize[width] + cInset[right]),
      0
    );

    if (paging && sizeWidth > 0) {
      minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
    }

    return Math.max(minOffsetX, Math.min(offsetX, 0));
  }

  const adjustedOffset: Point = {
    x: calculate('x'),
    y: calculate('y'),
  };

  if (adjustedOffset.x === offset.x && adjustedOffset.y === offset.y) {
    return offset;
  }

  return adjustedOffset;
}

export function getAdjustedBounceOffset(
  offset: Point,
  size: Size,
  cSize: Size,
  cInset: Inset,
  bound: Record<XY, Bound>
): Point {
  function calculate(x: XY) {
    const [width, height, left, right]: [WH, WH, LT, RB] =
      x === 'x'
        ? ['width', 'height', 'left', 'right']
        : ['height', 'width', 'top', 'bottom'];
    const offsetX = offset[x];
    const boundX = bound[x];

    if (boundX === -1) {
      return offsetX;
    }

    const minOffsetX = Math.min(
      size[width] - (cInset[left] + cSize[width] + cInset[right]),
      0
    );
    const maxDist = Math.min(size[width], size[height]) / 2;

    if (0 < offsetX) {
      if (boundX === 0) {
        return 0;
      }
      return maxDist * (1 - maxDist / (maxDist + offsetX));
    }
    if (offsetX < minOffsetX) {
      if (boundX === 0) {
        return minOffsetX;
      }
      return (
        minOffsetX - maxDist * (1 - maxDist / (maxDist - offsetX + minOffsetX))
      );
    }

    return offsetX;
  }

  const adjustedOffset: Point = {
    x: calculate('x'),
    y: calculate('y'),
  };

  if (adjustedOffset.x === offset.x && adjustedOffset.y === offset.y) {
    return offset;
  }

  return adjustedOffset;
}

export function getDecelerationEndOffset(
  offset: Point,
  velocity: Point,
  size: Size,
  paging: boolean,
  acc: Point | number
): Point {
  const accXY = typeof acc === 'number' ? getAcc(acc, velocity) : acc;

  function calculate(x: XY): number {
    const width = x === 'x' ? 'width' : 'height';

    let offsetX = offset[x];
    let velocityX = velocity[x];

    if (paging && size[width] > 0) {
      const minVelocity = 0.5;
      let delta = offsetX / size[width];

      if (minVelocity < velocityX) {
        delta = Math.ceil(delta);
      } else if (velocityX < -minVelocity) {
        delta = Math.floor(delta);
      } else {
        delta = Math.round(delta);
      }

      offsetX = size[width] * delta;
    } else {
      if (accXY[x]) {
        offsetX += (velocityX * (velocityX / accXY[x])) / 2;
      }
    }

    return offsetX;
  }

  return { x: calculate('x'), y: calculate('y') };
}

export function calculateOffsetForRect(
  rect: Rect,
  align: Record<XY, Align> | Align,
  cOffset: Point,
  size: Size
): Point {
  const alignXY = typeof align === 'object' ? align : { x: align, y: align };

  function calculate(x: XY) {
    const width = x === 'x' ? 'width' : 'height';

    let offsetX = -rect[x];
    let alignX = alignXY[x];
    const delta = size[width] - rect[width];

    if (alignX === 'auto') {
      const direction = delta < 0 ? -1 : 1;
      const dOffsetX = cOffset[x] - offsetX;

      offsetX +=
        direction *
        Math.max(0, Math.min(direction * dOffsetX, direction * delta));
    } else {
      if (alignX === 'start') {
        alignX = 0;
      } else if (alignX === 'center') {
        alignX = 0.5;
      } else if (alignX === 'end') {
        alignX = 1;
      }

      offsetX += alignX * delta;
    }

    return offsetX;
  }

  return {
    x: calculate('x'),
    y: calculate('y'),
  };
}
