function convertTransformTranslate(translate) {
  if (!translate) {
    return null;
  }
  return {
    transform: `translate3d(${translate[0]}px, ${translate[1]}px, 0)`,
    WebkitTransform: `translate3d(${translate[0]}px, ${translate[1]}px, 0)`,
    msTransform: `translate(${translate[0]}px, ${translate[1]}px)`,
  };
}

function create(styles) {
  const { transformTranslate, ...style } = styles;

  return {
    ...style,
    ...convertTransformTranslate(transformTranslate),
  };
}

export default { create };
