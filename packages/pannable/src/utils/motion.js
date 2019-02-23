export function getAdjustedContentOffset(offset, size, cSize, name) {
  if (name) {
    return Math.max(Math.min(size - cSize, 0), Math.min(offset, 0));
  }

  return {
    x: getAdjustedContentOffset(offset.x, size.width, cSize.width, 'x'),
    y: getAdjustedContentOffset(offset.y, size.height, cSize.height, 'y'),
  };
}

export function getAdjustedPagingOffset(offset, size, name) {
  if (name) {
    return size ? size * Math.round(offset / size) : 0;
  }

  return {
    x: getAdjustedPagingOffset(offset.x, size.width, 'x'),
    y: getAdjustedPagingOffset(offset.y, size.height, 'y'),
  };
}

export function getAdjustedPagingVelocity(velocity, size, rate, name) {
  if (name) {
    const redirect = velocity > 0 ? 1 : -1;

    return redirect * Math.min(Math.abs(velocity), Math.sqrt(rate * size));
  }

  return {
    x: getAdjustedPagingVelocity(velocity.x, size.width, rate, 'x'),
    y: getAdjustedPagingVelocity(velocity.y, size.height, rate, 'y'),
  };
}

export function getDecelerationEndPosition(offset, velocity, rate, name) {
  if (name) {
    const redirect = velocity > 0 ? 1 : -1;
    const acc = rate * redirect;

    return offset + (0.5 * velocity * velocity) / acc;
  }

  return {
    x: getDecelerationEndPosition(offset.x, velocity.x, rate, 'x'),
    y: getDecelerationEndPosition(offset.y, velocity.y, rate, 'y'),
  };
}

export function calculateDeceleration(
  interval,
  rate,
  offset,
  velocity,
  offsetEnd,
  name
) {
  if (name) {
    let nVelocity = 0;
    let nOffset = offsetEnd;

    const dist = offsetEnd - offset;
    const redirect = dist > 0 ? 1 : -1;
    const acc = rate * redirect;

    const velocityH =
      Math.sqrt(0.5 * velocity * velocity + acc * dist) * redirect;
    const timeH = (velocityH - velocity) / acc;
    const time = (2 * velocityH - velocity) / acc;

    if (interval < time) {
      nVelocity = velocityH - acc * Math.abs(timeH - interval);
      nOffset =
        offset +
        0.5 * (velocity + velocityH) * timeH -
        0.5 *
          (2 * velocityH - acc * Math.abs(timeH - interval)) *
          (timeH - interval);
    }

    return { offset: nOffset, velocity: nVelocity };
  }

  const nextX = calculateDeceleration(
    interval,
    rate,
    offset.x,
    velocity.x,
    offsetEnd.x,
    'x'
  );
  const nextY = calculateDeceleration(
    interval,
    rate,
    offset.y,
    velocity.y,
    offsetEnd.y,
    'y'
  );

  return {
    offset: { x: nextX.offset, y: nextY.offset },
    velocity: { x: nextX.velocity, y: nextY.velocity },
  };
}
