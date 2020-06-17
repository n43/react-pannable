function getAcc(rate, { x, y }) {
  const r = Math.sqrt(x * x + y * y);

  if (r === 0) {
    return { x: 0, y: 0 };
  }
  return { x: rate * (x / r), y: rate * (y / r) };
}

export function getAdjustedContentVelocity(velocity, name) {
  if (name) {
    const x = name === 'y' ? 'y' : 'x';
    const maxVelocity = 2.5;

    return Math.max(-maxVelocity, Math.min(velocity[x], maxVelocity));
  }

  const adjustedVelocity = {
    x: getAdjustedContentVelocity(velocity, 'x'),
    y: getAdjustedContentVelocity(velocity, 'y'),
  };

  if (adjustedVelocity.x === velocity.x && adjustedVelocity.y === velocity.y) {
    return velocity;
  }

  return adjustedVelocity;
}

export function getAdjustedContentOffset(
  offset,
  size,
  cSize,
  boundless,
  paging,
  name
) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];
    const sizeWidth = size[width];
    const offsetX = offset[x];

    if (boundless[x]) {
      return offsetX;
    }

    let minOffsetX = Math.min(sizeWidth - cSize[width], 0);

    if (paging && sizeWidth > 0) {
      minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
    }

    return Math.max(minOffsetX, Math.min(offsetX, 0));
  }

  const adjustedOffset = {
    x: getAdjustedContentOffset(offset, size, cSize, boundless, paging, 'x'),
    y: getAdjustedContentOffset(offset, size, cSize, boundless, paging, 'y'),
  };

  if (adjustedOffset.x === offset.x && adjustedOffset.y === offset.y) {
    return offset;
  }

  return adjustedOffset;
}

export function getAdjustedBounceOffset(
  offset,
  bounce,
  boundless,
  size,
  cSize,
  name
) {
  if (name) {
    const [x, width, height] =
      name === 'y' ? ['y', 'height', 'width'] : ['x', 'width', 'height'];
    const offsetX = offset[x];
    const bounceX = bounce[x];

    if (boundless[x]) {
      return offsetX;
    }

    const minOffsetX = Math.min(size[width] - cSize[width], 0);
    const maxDist = 0.5 * Math.min(size[width], size[height]);

    if (0 < offsetX) {
      if (!bounceX) {
        return 0;
      }
      return maxDist * (1 - maxDist / (maxDist + offsetX));
    }
    if (offsetX < minOffsetX) {
      if (!bounceX) {
        return minOffsetX;
      }
      return (
        minOffsetX - maxDist * (1 - maxDist / (maxDist - offsetX + minOffsetX))
      );
    }

    return offsetX;
  }

  const adjustedOffset = {
    x: getAdjustedBounceOffset(offset, bounce, boundless, size, cSize, 'x'),
    y: getAdjustedBounceOffset(offset, bounce, boundless, size, cSize, 'y'),
  };

  if (adjustedOffset.x === offset.x && adjustedOffset.y === offset.y) {
    return offset;
  }

  return adjustedOffset;
}

export function getDecelerationEndOffset(
  /* target's offset and velocity */
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
      if (acc[x]) {
        offsetX += 0.5 * velocityX * (velocityX / acc[x]);
      }
    }

    return offsetX;
  }

  if (typeof acc !== 'object') {
    acc = getAcc(acc, velocity);
  }

  return {
    x: getDecelerationEndOffset(offset, velocity, size, paging, acc, 'x'),
    y: getDecelerationEndOffset(offset, velocity, size, paging, acc, 'y'),
  };
}

export function calculateDeceleration(deceleration, t, name) {
  const { points, duration, startTime, endOffset } = deceleration;

  if (name) {
    const [x] = name === 'y' ? ['y'] : ['x'];
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

  const moveTime = new Date().getTime();
  t = 1;

  if (duration > 0) {
    t = (moveTime - startTime) / duration;
  }

  if (t < 0 || 1 <= t) {
    return {
      offset: endOffset,
      velocity: { x: 0, y: 0 },
      didEnd: true,
    };
  }

  const { xOffset, yOffset, xVelocity, yVelocity } = {
    ...calculateDeceleration(deceleration, t, 'x'),
    ...calculateDeceleration(deceleration, t, 'y'),
  };

  return {
    offset: { x: xOffset, y: yOffset },
    velocity: { x: xVelocity, y: yVelocity },
    didEnd: false,
  };
}

export function createDeceleration(
  endOffset,
  rate,
  startOffset,
  startVelocity
) {
  const startTime = new Date().getTime();
  let duration = 0;

  if (!rate) {
    return { endOffset, rate, duration, startTime };
  }

  const s = {
    x: endOffset.x - startOffset.x,
    y: endOffset.y - startOffset.y,
  };

  const sm = Math.sqrt(Math.pow(s.x, 2) + Math.pow(s.y, 2));
  let vm;

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

  return { endOffset, rate, duration, startTime, points };
}
