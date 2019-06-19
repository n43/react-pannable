export function getItemVisibleRect(rect, vRect, name) {
  if (!vRect) {
    return vRect;
  }

  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    return { [x]: vRect[x] - rect[x], [width]: vRect[width] };
  }

  return {
    ...getItemVisibleRect(rect, vRect, 'x'),
    ...getItemVisibleRect(rect, vRect, 'y'),
  };
}

export function needsRender(rect, vRect, name) {
  if (!vRect) {
    return true;
  }

  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    return (
      vRect[x] - 0.25 * vRect[width] <= rect[x] + rect[width] &&
      rect[x] <= vRect[x] + 1.25 * vRect[width]
    );
  }

  return needsRender(rect, vRect, 'x') && needsRender(rect, vRect, 'y');
}
