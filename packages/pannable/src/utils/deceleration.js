export function needsScrollDeceleration(offset, velocity, size) {
  return velocity.x !== 0 || velocity.y !== 0;
}

export function calculateScrollDeceleration(
  interval,
  offset,
  velocity,
  size,
  cSize
) {
  const rate = 0.002;
  const redirect = velocity > 0 ? 1 : -1;
  const acc = rate * redirect;
  let nVelocity;
  let nOffset;

  const time = velocity / acc;

  if (interval < time) {
    nVelocity = velocity - acc * interval;
    nOffset = offset + 0.5 * (2 * velocity - acc * interval) * interval;
  } else {
    nVelocity = 0;
    nOffset = offset + 0.5 * velocity * (velocity / acc);
  }

  const anOffset = Math.max(Math.min(size - cSize), Math.min(nOffset, 0));

  if (anOffset !== nOffset) {
    nOffset = anOffset;
    nVelocity = 0;
  }

  return { velocity: nVelocity, offset: nOffset };
}

export function needsPagingDeceleration(offset, velocity, size) {
  return offset.x % size.width !== 0 || offset.y % size.height !== 0;
}

export function calculatePagingDeceleration(
  interval,
  offset,
  velocity,
  size,
  cSize
) {
  const rate = 0.01;
  const pageNum = Math.round(-offset / size);
  const dist = -offset - pageNum * size;
  const redirect = dist > 0 ? 1 : -1;
  const acc = rate * redirect;
  let nVelocity;
  let nOffset;

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
  } else {
    nVelocity = 0;
    nOffset = offset + dist;
  }

  const anOffset = Math.max(Math.min(size - cSize), Math.min(nOffset, 0));

  if (anOffset !== nOffset) {
    nOffset = anOffset;
    nVelocity = 0;
  }

  return { velocity: nVelocity, offset: nOffset };
}
