interface IndexableWindow {
  [key: string]: any;
}

let requestAnimationFrame: (callback: FrameRequestCallback) => number;
let cancelAnimationFrame: (handle: number) => void;

if (typeof window !== 'undefined') {
  requestAnimationFrame = window.requestAnimationFrame;
  cancelAnimationFrame = window.cancelAnimationFrame;

  const vendors = ['ms', 'moz', 'webkit', 'o'];
  const win = window as IndexableWindow;
  let idx = 0;

  while (!requestAnimationFrame && idx < vendors.length) {
    requestAnimationFrame = win[vendors[idx] + 'RequestAnimationFrame'];
    cancelAnimationFrame =
      win[vendors[idx] + 'CancelAnimationFrame'] ||
      win[vendors[idx] + 'CancelRequestAnimationFrame'];
    idx++;
  }

  if (!requestAnimationFrame) {
    let lastTime = 0;

    requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));

      const id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);

      lastTime = currTime + timeToCall;
      return id;
    };

    cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
  }
}

export { requestAnimationFrame, cancelAnimationFrame };
