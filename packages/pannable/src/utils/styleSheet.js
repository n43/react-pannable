function transformPrefixer(transformFunction) {
  if (!transformFunction) {
    return {};
  }
  return {
    transform: transformFunction,
    WebkitTransform: transformFunction,
    MsTransform: transformFunction,
  };
}

function create(styles) {
  return { ...styles, ...transformPrefixer(styles['transform']) };
}

let styleSheet = {
  create,
};

export default styleSheet;
