function convertTransformTranslate(translate, style) {
  style.transform = `translate3d(${translate[0]}px, ${translate[1]}px, 0)`;
  style.WebkitTransform = `translate3d(${translate[0]}px, ${
    translate[1]
  }px, 0)`;
  style.msTransform = `translate(${translate[0]}px, ${translate[1]}px)`;
}

function convertUserSelect(userSelect, style) {
  style.userSelect = userSelect;
  style.WebkitUserSelect = userSelect;
  style.msUserSelect = userSelect;
}

function create(styles) {
  const { transformTranslate, userSelect, ...style } = styles;

  if (transformTranslate) {
    convertTransformTranslate(transformTranslate, style);
  }
  if (userSelect) {
    convertUserSelect(userSelect, style);
  }

  return style;
}

export default { create };
