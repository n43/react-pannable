export function translate3d(x = 0, y = 0, z = 0) {
  const transformFunction = `translate3d(${x}px, ${y}px, ${z}px)`;

  return transform(transformFunction);
}

function transform(transformFunction) {
  return {
    transform: transformFunction,
    WebkitTransform: transformFunction,
    MsTransform: transformFunction,
  };
}
