// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/

/* eslint no-restricted-globals:"off" */

let root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else {
  root = {};
}

export const requestAnimationFrame =
  root.requestAnimationFrame ||
  root.webkitRequestAnimationFrame ||
  root.mozRequestAnimationFrame ||
  root.msRequestAnimationFrame ||
  (root.setTimeout && (fn => root.setTimeout(fn, 20))) ||
  (() => {});

export const cancelAnimationFrame =
  root.cancelAnimationFrame ||
  root.webkitCancelAnimationFrame ||
  root.mozCancelAnimationFrame ||
  root.clearTimeout ||
  (() => {});
