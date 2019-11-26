export function getElementSize(element) {
  let width = 0;
  let height = 0;

  if (typeof window !== 'undefined') {
    width = element.offsetWidth;
    height = element.offsetHeight;

    if (window.getComputedStyle) {
      const styles = window.getComputedStyle(element) || {};

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
    }
  }

  return { width, height };
}
