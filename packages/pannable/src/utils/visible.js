export function getItemVisibleRect(rect, vRect, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];
    const left = Math.max(rect[x], vRect[x]);
    const right = Math.min(rect[x] + rect[width], vRect[x] + vRect[width]);

    return { [x]: left - rect[x], [width]: Math.max(0, right - left) };
  }

  return {
    ...getItemVisibleRect(rect, vRect, 'x'),
    ...getItemVisibleRect(rect, vRect, 'y'),
  };
}

export function needsRender(rect, vRect, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    const dx = rect[x] - vRect[x];
    return -0.25 * vRect[width] < dx + rect[width] && dx < 1.25 * vRect[width];
  }

  return needsRender(rect, vRect, 'x') && needsRender(rect, vRect, 'y');
}
