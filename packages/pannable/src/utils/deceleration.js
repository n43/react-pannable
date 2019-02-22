export function calculateScrollDecelerationEndPosition(offset, velocity, rate) {
  const redirect = velocity > 0 ? 1 : -1;
  const acc = rate * redirect;
  const dist = (0.5 * velocity * velocity) / acc;

  return offset + dist;
}

export function calculatePagingDecelerationEndPosition(
  offset,
  velocity,
  rate,
  size
) {
  const pageNum = size > 0 ? Math.round(offset / size) : 0;
  const dist = pageNum * size - offset;

  return offset + dist;
}

export function calculateDeceleration(
  interval,
  rate,
  offset,
  velocity,
  offsetEnd
) {
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

  return { velocity: nVelocity, offset: nOffset };
}
