const ANIMATION_INTERVAL = 1000 / 60;

// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
let requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, ANIMATION_INTERVAL);
  };
let cancelAnimationFrame =
  window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  function(id) {
    window.clearTimeout(id);
  };

export { requestAnimationFrame, cancelAnimationFrame, ANIMATION_INTERVAL };
