export function getAdjustedContentOffset(offset, size, cSize, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    return Math.max(
      Math.min(size[width] - cSize[width], 0),
      Math.min(offset[x], 0)
    );
  }

  return {
    x: getAdjustedContentOffset(offset, size, cSize, 'x'),
    y: getAdjustedContentOffset(offset, size, cSize, 'y'),
  };
}

export function getAdjustedPagingOffset(offset, size, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    return size[width] ? size[width] * Math.round(offset[x] / size[width]) : 0;
  }

  return {
    x: getAdjustedPagingOffset(offset, size, 'x'),
    y: getAdjustedPagingOffset(offset, size, 'y'),
  };
}

function getAcc(rate, { x, y }) {
  const r = Math.sqrt(x * x + y * y);

  return { x: rate * (x / r), y: rate * (y / r) };
}

export function getAdjustedPagingVelocity(velocity, size, acc, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    if (!acc[x]) {
      return 0;
    }

    const direction = acc[x] < 0 ? -1 : 1;

    return (
      direction *
      Math.min(
        Math.abs(velocity[x]),
        Math.sqrt(direction * acc[x] * size[width])
      )
    );
  }

  if (typeof acc === 'number') {
    acc = getAcc(acc, velocity);
  }

  return {
    x: getAdjustedPagingVelocity(velocity, size, acc, 'x'),
    y: getAdjustedPagingVelocity(velocity, size, acc, 'y'),
  };
}

export function getDecelerationEndOffset(offset, velocity, acc, name) {
  if (name) {
    const x = name;

    if (!acc[x]) {
      return offset[x];
    }

    return offset[x] + 0.5 * velocity[x] * (velocity[x] / acc[x]);
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
  offset,
  velocity,
  offsetEnd,
  name
) {
  if (name) {
    const x = name;

    if (!acc[x]) {
      return { offset: offsetEnd[x], velocity: 0 };
    }

    const dist = offsetEnd[x] - offset[x];
    const direction = acc[x] < 0 ? -1 : 1;

    const velocityH =
      direction * Math.sqrt(0.5 * velocity[x] * velocity[x] + acc[x] * dist);
    const timeH = acc[x] ? (velocityH - velocity[x]) / acc[x] : 0;
    const time = acc[x] ? (2 * velocityH - velocity[x]) / acc[x] : 0;

    if (time < interval) {
      return { offset: offsetEnd[x], velocity: 0 };
    }

    return {
      offset:
        offset[x] +
        0.5 * (velocity[x] + velocityH) * timeH -
        0.5 *
          (2 * velocityH - acc[x] * Math.abs(timeH - interval)) *
          (timeH - interval),
      velocity: velocityH - acc[x] * Math.abs(timeH - interval),
    };
  }

  if (typeof acc === 'number') {
    acc = getAcc(acc, { x: offsetEnd.x - offset.x, y: offsetEnd.y - offset.y });
  }

  const nextX = calculateDeceleration(
    interval,
    acc,
    offset,
    velocity,
    offsetEnd,
    'x'
  );
  const nextY = calculateDeceleration(
    interval,
    acc,
    offset,
    velocity,
    offsetEnd,
    'y'
  );

  return {
    offset: { x: nextX.offset, y: nextY.offset },
    velocity: { x: nextX.velocity, y: nextY.velocity },
  };
}

export function calculateRectOffset(rOrigin, rSize, align, offset, size, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];
    let nOffset;

    if (align[x] === 'auto') {
      const direction = size[width] < rSize[width] ? -1 : 1;
      nOffset =
        -rOrigin[x] +
        direction *
          Math.max(
            0,
            Math.min(
              direction * (rOrigin[x] + offset[x]),
              direction * (size[width] - rSize[width])
            )
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

      nOffset = -rOrigin[x] + align[x] * (size[width] - rSize[width]);
    }

    return nOffset;
  }

  if (typeof align !== 'object') {
    align = { x: align, y: align };
  }

  return {
    x: calculateRectOffset(rOrigin, rSize, align, offset, size, 'x'),
    y: calculateRectOffset(rOrigin, rSize, align, offset, size, 'y'),
  };
}
