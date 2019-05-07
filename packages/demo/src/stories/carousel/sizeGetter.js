export function getSize() {
  const winW = window.document.body.clientWidth;
  let padW = 750;
  let padH = 400;

  if (winW < 750) {
    padW = 375;
    padH = 200;
  }

  return { width: padW, height: padH };
}
