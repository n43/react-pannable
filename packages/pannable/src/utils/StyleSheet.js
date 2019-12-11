function convertTransformTranslate(translate, style) {
  style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0)`;
  style.WebkitTransform = `translate3d(${translate.x}px, ${translate.y}px, 0)`;
  style.msTransform = `translate(${translate.x}px, ${translate.y}px)`;
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
