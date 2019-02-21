let Sizer = {};

function getSize(node) {
  const width = node.offsetWidth || 0;
  const height = node.offsetHeight || 0;
  const styles = window.getComputedStyle(node) || {};

  const paddingLeft = parseInt(styles.paddingLeft, 10) || 0;
  const paddingRight = parseInt(styles.paddingRight, 10) || 0;
  const paddingTop = parseInt(styles.paddingTop, 10) || 0;
  const paddingBottom = parseInt(styles.paddingBottom, 10) || 0;

  const realHeight = height - paddingTop - paddingBottom;
  const realWidth = width - paddingLeft - paddingRight;

  return { width: realWidth, height: realHeight };
}

Sizer = {
  getSize,
};

export default Sizer;
