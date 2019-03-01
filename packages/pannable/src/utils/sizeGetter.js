export function getElementSize(element) {
  const styles = window.getComputedStyle(element) || {};

  let width = element.offsetWidth || 0;
  let height = element.offsetHeight || 0;

  if (styles.paddingLeft) {
    width -= parseInt(styles.paddingLeft, 10);
  }
  if (styles.paddingRight) {
    width -= parseInt(styles.paddingRight, 10);
  }
  if (styles.borderLeftWidth) {
    width -= parseInt(styles.borderLeftWidth, 10);
  }
  if (styles.borderRightWidth) {
    width -= parseInt(styles.borderRightWidth, 10);
  }
  if (styles.paddingTop) {
    height -= parseInt(styles.paddingTop, 10);
  }
  if (styles.paddingBottom) {
    height -= parseInt(styles.paddingBottom, 10);
  }
  if (styles.borderTopWidth) {
    height -= parseInt(styles.borderTopWidth, 10);
  }
  if (styles.borderBottomWidth) {
    height -= parseInt(styles.borderBottomWidth, 10);
  }

  return { width, height };
}
