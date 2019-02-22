export function getElementSize(element) {
  if (!element) {
    return { width: 0, height: 0 };
  }

  const width = element.offsetWidth || 0;
  const height = element.offsetHeight || 0;
  const styles = window.getComputedStyle(element) || {};

  const paddingLeft = parseInt(styles.paddingLeft, 10) || 0;
  const paddingRight = parseInt(styles.paddingRight, 10) || 0;
  const paddingTop = parseInt(styles.paddingTop, 10) || 0;
  const paddingBottom = parseInt(styles.paddingBottom, 10) || 0;

  const realHeight = height - paddingTop - paddingBottom;
  const realWidth = width - paddingLeft - paddingRight;

  return { width: realWidth, height: realHeight };
}

export function getElementScrollSize(element) {
  if (!element) {
    return { width: 0, height: 0 };
  }

  const width = element.scrollWidth || 0;
  const height = element.scrollHeight || 0;

  return { width, height };
}
