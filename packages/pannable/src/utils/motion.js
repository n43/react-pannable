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

    offsetX = Math.max(minOffsetX, Math.min(offsetX, 0));

    if (paging) {
      if (size[width] === 0) {
        offsetX = 0;
      } else {
        offsetX = size[width] * Math.round(offsetX / size[width]);
      }
    }

    return offsetX;
  }

  return {
    x: getAdjustedContentOffset(offset, size, cSize, paging, 'x'),
    y: getAdjustedContentOffset(offset, size, cSize, paging, 'y'),
  };
}

export function getAdjustedBounceOffset(offset, bounce, size, cSize, name) {
  if (name) {
    const [x, width, height] =
      name === 'y' ? ['y', 'height', 'width'] : ['x', 'width', 'height'];

    const offsetX = offset[x];
    const minOffsetX = Math.min(size[width] - cSize[width], 0);
    const maxDist = 0.25 * Math.min(size[width], size[height]);

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

  return {
    x: getAdjustedBounceOffset(offset, bounce, size, cSize, 'x'),
    y: getAdjustedBounceOffset(offset, bounce, size, cSize, 'y'),
  };
}

export function getAdjustedContentVelocity(
  velocity,
  offset,
  offsetEnd,
  size,
  rate,
  name
) {
  if (name) {
    const [x, width, height] =
      name === 'y' ? ['y', 'height', 'width'] : ['x', 'width', 'height'];

    const direction = velocity[x] < 0 ? -1 : 1;
    const maxDist = 0.125 * Math.min(size[width], size[height]);

    if (direction * (offsetEnd[x] - offset[x]) > 0) {
      return velocity[x];
    }
    return (
      direction * Math.min(Math.abs(velocity[x]), Math.sqrt(2 * rate * maxDist))
    );
  }

  return {
    x: getAdjustedContentVelocity(velocity, offset, offsetEnd, size, rate, 'x'),
    y: getAdjustedContentVelocity(velocity, offset, offsetEnd, size, rate, 'y'),
  };
}

export function getDecelerationEndOffset(offset, velocity, acc, name) {
  if (name) {
    const x = name;

    let offsetX = offset[x];

    if (acc[x]) {
      offsetX += 0.5 * velocity[x] * (velocity[x] / acc[x]);
    }

    return offsetX;
  }

  if (typeof acc === 'number') {
    acc = getAcc(acc, velocity);
  }

  return {
    x: getDecelerationEndOffset(offset, velocity, acc, 'x'),
    y: getDecelerationEndOffset(offset, velocity, acc, 'y'),
  };
}

export function calculateDeceleration(
  interval,
  acc,
  velocity,
  offset,
  offsetEnd,
  name
) {
  if (name) {
    const x = name;

    let offsetX = offset[x];
    let velocityX = velocity[x];

    if (acc[x]) {
      const direction = acc[x] < 0 ? -1 : 1;
      const dist = offsetEnd[x] - offsetX;

      const velocityH =
        direction * Math.sqrt(0.5 * velocityX * velocityX + acc[x] * dist);
      const timeH = (velocityH - velocityX) / acc[x];
      const time = (2 * velocityH - velocityX) / acc[x];

      if (time < interval) {
        offsetX = offsetEnd[x];
        velocityX = 0;
      } else {
        offsetX +=
          0.5 * (velocityX + velocityH) * timeH -
          0.5 *
            (2 * velocityH - acc[x] * Math.abs(timeH - interval)) *
            (timeH - interval);
        velocityX = velocityH - acc[x] * Math.abs(timeH - interval);
      }
    }

    return { offset: offsetX, velocity: velocityX };
  }

  if (typeof acc === 'number') {
    let vector = {
      x: offsetEnd.x - offset.x,
      y: offsetEnd.y - offset.y,
    };

    if (vector.x === 0 && vector.y === 0) {
      vector = velocity;
    }

    acc = getAcc(acc, vector);
  }

  const nextX = calculateDeceleration(
    interval,
    acc,
    velocity,
    offset,
    offsetEnd,
    'x'
  );
  const nextY = calculateDeceleration(
    interval,
    acc,
    velocity,
    offset,
    offsetEnd,
    'y'
  );

  return {
    offset: { x: nextX.offset, y: nextY.offset },
    velocity: { x: nextX.velocity, y: nextY.velocity },
  };
}

export function calculateRectOffset(rect, align, offset, size, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetX = -rect[x];
    const maxOffsetX = size[width] - rect[width];

    if (align[x] === 'auto') {
      const direction = maxOffsetX < 0 ? -1 : 1;

      offsetX +=
        direction *
        Math.max(
          0,
          Math.min(direction * (offset[x] - offsetX), direction * maxOffsetX)
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
    x: calculateRectOffset(rect, align, offset, size, 'x'),
    y: calculateRectOffset(rect, align, offset, size, 'y'),
  };
}
