/* eslint no-restricted-globals:"off" */

let root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else {
  root = {};
}

export function getElementSize(element) {
  let width = element.offsetWidth || 0;
  let height = element.offsetHeight || 0;

  if (root.getComputedStyle) {
    const styles = root.getComputedStyle(element) || {};

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

  return { width, height };
}
