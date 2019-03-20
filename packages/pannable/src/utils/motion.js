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
      if (!size[width]) {
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

  return {
    x: getAdjustedBounceOffset(offset, bounce, size, cSize, 'x'),
    y: getAdjustedBounceOffset(offset, bounce, size, cSize, 'y'),
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

export function getAdjustedPagingOffset(offset, offsetEnd, size, cSize, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetEndX = offsetEnd[x];
    let minOffsetX = Math.min(size[width] - cSize[width], 0);

    minOffsetX = Math.max(minOffsetX, Math.min(offset[x], 0));

    if (!size[width]) {
      minOffsetX = 0;
    } else {
      minOffsetX = size[width] * Math.floor(offset[x] / size[width]);
    }

    offsetEndX = Math.max(
      minOffsetX,
      Math.min(offsetEndX, minOffsetX + size[width])
    );

    return offsetEndX;
  }

  return {
    x: getAdjustedPagingOffset(offset, offsetEnd, size, cSize, 'x'),
    y: getAdjustedPagingOffset(offset, offsetEnd, size, cSize, 'y'),
  };
}

export function calculateDeceleration(
  interval,
  acc,
  velocity,
  offset,
  offsetEnd,
  size,
  name
) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetX = offset[x];
    let velocityX = velocity[x];

    if (acc[x]) {
      const direction = acc[x] < 0 ? -1 : 1;
      const dist = offsetEnd[x] - offsetX;
      let velocityH =
        direction * Math.sqrt(0.5 * velocityX * velocityX + acc[x] * dist);
      let timeH = (velocityH - velocityX) / acc[x];

      if (timeH < 0) {
        velocityH = velocityX;
        timeH = 0;
      }

      const time = (2 * velocityH - velocityX) / acc[x];

      if (time < interval) {
        velocityX = 0;
        offsetX = offsetEnd[x];
      } else {
        velocityX = velocityH - acc[x] * Math.abs(timeH - interval);
        offsetX +=
          0.5 * (velocity[x] + velocityH) * timeH -
          0.5 * (velocityH + velocityX) * (timeH - interval);

        if (direction * (offsetEnd[x] - offsetX) <= 0) {
          const direction2 = velocityX < 0 ? -1 : 1;

          velocityX =
            direction2 *
            Math.min(
              Math.abs(velocityX),
              Math.sqrt(2 * direction * acc[x] * 0.25 * size[width])
            );
        }
      }
    } else {
      offsetX += velocityX * interval;
    }

    return { offset: { [x]: offsetX }, velocity: { [x]: velocityX } };
  }

  if (typeof acc === 'number') {
    acc = getAcc(acc, { x: offsetEnd.x - offset.x, y: offsetEnd.y - offset.y });
  }

  const nextX = calculateDeceleration(
    interval,
    acc,
    velocity,
    offset,
    offsetEnd,
    size,
    'x'
  );
  const nextY = calculateDeceleration(
    interval,
    acc,
    velocity,
    offset,
    offsetEnd,
    size,
    'y'
  );

  return {
    offset: { ...nextX.offset, ...nextY.offset },
    velocity: { ...nextX.velocity, ...nextY.velocity },
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
