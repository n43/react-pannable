function getAcc(rate, { x, y }) {
  const r = Math.sqrt(x * x + y * y);

  if (r === 0) {
    return { x: 0, y: 0 };
  }
  return { x: rate * (x / r), y: rate * (y / r) };
}

export function getAdjustedContentOffset(offset, size, cSize, paging, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    const minOffsetX = Math.min(size[width] - cSize[width], 0);
    let offsetX = offset[x];

    if (0 < offsetX) {
      offsetX = 0;
    } else if (offsetX < minOffsetX) {
      offsetX = minOffsetX;

      if (paging && size[width] > 0) {
        offsetX = size[width] * Math.ceil(offsetX / size[width]);
      }
    } else {
      if (paging && size[width] > 0) {
        offsetX = size[width] * Math.round(offsetX / size[width]);
      }
    }

    return offsetX;
  }

  const adjustedOffset = {
    x: getAdjustedContentOffset(offset, size, cSize, paging, 'x'),
    y: getAdjustedContentOffset(offset, size, cSize, paging, 'y'),
  };

  if (adjustedOffset.x === offset.x && adjustedOffset.y === offset.y) {
    return offset;
  }

  return adjustedOffset;
}

export function getAdjustedBounceOffset(offset, bounce, size, cSize, name) {
  if (name) {
    const [x, width, height] =
      name === 'y' ? ['y', 'height', 'width'] : ['x', 'width', 'height'];

    const offsetX = offset[x];
    const minOffsetX = Math.min(size[width] - cSize[width], 0);
    const maxDist = 0.5 * Math.min(size[width], size[height]);

    if (0 < offsetX) {
      if (bounce[x]) {
        return maxDist * (1 - maxDist / (maxDist + offsetX));
      }
      return 0;
    }
    if (offsetX < minOffsetX) {
      if (bounce[x]) {
        return (
          minOffsetX -
          maxDist * (1 - maxDist / (maxDist - offsetX + minOffsetX))
        );
      }
      return minOffsetX;
    }

    return offsetX;
  }

  const adjustedOffset = {
    x: getAdjustedBounceOffset(offset, bounce, size, cSize, 'x'),
    y: getAdjustedBounceOffset(offset, bounce, size, cSize, 'y'),
  };

  if (adjustedOffset.x === offset.x && adjustedOffset.y === offset.y) {
    return offset;
  }

  return adjustedOffset;
}

export function getDecelerationEndOffset(
  offset,
  velocity,
  size,
  paging,
  acc,
  name
) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetX = offset[x];

    if (acc[x]) {
      offsetX += 0.5 * velocity[x] * (velocity[x] / acc[x]);
    }
    if (paging && size[width] > 0) {
      offsetX = size[width] * Math.round(offsetX / size[width]);
    }

    return offsetX;
  }

  if (typeof acc === 'number') {
    acc = getAcc(acc, velocity);
  }

  return {
    x: getDecelerationEndOffset(offset, velocity, size, paging, acc, 'x'),
    y: getDecelerationEndOffset(offset, velocity, size, paging, acc, 'y'),
  };
}

export function getAdjustedContentVelocity(velocity, size, acc, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    if (!velocity[x]) {
      return 1;
    }

    const direction = velocity[x] < 0 ? -1 : 1;
    const maxDist = 0.25 * size[width];
    const maxVelocity =
      direction *
      Math.min(
        direction * velocity[x],
        Math.sqrt(2 * maxDist * direction * acc[x])
      );

    return maxVelocity / velocity[x];
  }

  if (typeof acc === 'number') {
    acc = getAcc(acc, velocity);
  }

  const n = Math.min(
    getAdjustedContentVelocity(velocity, size, acc, 'x'),
    getAdjustedContentVelocity(velocity, size, acc, 'y')
  );

  if (n === 1) {
    return velocity;
  }

  return { x: n * velocity.x, y: n * velocity.y };
}

export function calculateDeceleration(deceleration, moveTime, name) {
  if (name) {
    const [x] = name === 'y' ? ['y'] : ['x'];
    const { points, duration, startTime } = deceleration;
    const t = Math.max(0, Math.min((moveTime - startTime) / duration, 1));
    const [p0, p1, p2, p3] = points[x];
    const offsetX =
      p0 -
      3 * (p0 - p1) * t +
      3 * (p0 - 2 * p1 + p2) * Math.pow(t, 2) -
      (p0 - 3 * p1 + 3 * p2 - p3) * Math.pow(t, 3);
    const velocityX =
      (-3 * (p0 - p1) +
        6 * (p0 - 2 * p1 + p2) * t -
        3 * (p0 - 3 * p1 + 3 * p2 - p3) * Math.pow(t, 2)) /
      duration;

    return { [x + 'Offset']: offsetX, [x + 'Velocity']: velocityX };
  }

  return {
    ...calculateDeceleration(deceleration, moveTime, 'x'),
    ...calculateDeceleration(deceleration, moveTime, 'y'),
  };
}

export function createDeceleration(
  startOffset,
  startVelocity,
  endOffset,
  rate
) {
  const s = {
    x: endOffset.x - startOffset.x,
    y: endOffset.y - startOffset.y,
  };

  const sm = Math.sqrt(Math.pow(s.x, 2) + Math.pow(s.y, 2));
  let vm;
  let duration;

  if (sm) {
    vm = (startVelocity.x * s.x + startVelocity.y * s.y) / sm;

    let vh = Math.sqrt(0.5 * Math.pow(vm, 2) + rate * sm);
    let th = (vh - vm) / rate;

    if (th < 0) {
      vh = vm;
      th = 0;
    }

    duration = th + vh / rate;
  } else {
    vm = Math.sqrt(Math.pow(startVelocity.x, 2) + Math.pow(startVelocity.y, 2));
    duration = ((Math.sqrt(2) + 1) * vm) / rate;
  }

  if (duration <= 0) {
    return null;
  }

  const points = {
    x: [
      startOffset.x,
      startOffset.x + startVelocity.x * (duration / 3.0),
      endOffset.x,
      endOffset.x,
    ],
    y: [
      startOffset.y,
      startOffset.y + startVelocity.y * (duration / 3.0),
      endOffset.y,
      endOffset.y,
    ],
  };

  return {
    points,
    duration,
    startTime: new Date().getTime(),
    endOffset,
  };
}

export function calculateRectOffset(rect, vRect, align, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetX = -rect[x];
    const maxOffsetX = vRect[width] - rect[width];

    if (align[x] === 'auto') {
      const direction = maxOffsetX < 0 ? -1 : 1;
      const vOffsetX = -vRect[x];

      offsetX +=
        direction *
        Math.max(
          0,
          Math.min(direction * (vOffsetX - offsetX), direction * maxOffsetX)
        );
    } else {
      if (align[x] === 'start') {
        align[x] = 0;
      } else if (align[x] === 'center') {
        align[x] = 0.5;
      } else if (align[x] === 'end') {
        align[x] = 1;
      }
      if (typeof align[x] !== 'number' || isNaN(align[x])) {
        align[x] = 0.5;
      }

      offsetX += align[x] * maxOffsetX;
    }

    return offsetX;
  }

  if (typeof align !== 'object') {
    align = { x: align, y: align };
  }

  return {
    x: calculateRectOffset(rect, vRect, align, 'x'),
    y: calculateRectOffset(rect, vRect, align, 'y'),
  };
}
