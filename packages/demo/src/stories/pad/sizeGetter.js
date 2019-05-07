export function getSize() {
  const winW = window.document.body.clientWidth;
  let padW = 375;
  let padH = 650;

  if (winW < 750) {
    padW = 320;
    padH = 580;
  }

  return { width: padW, height: padH };
}
