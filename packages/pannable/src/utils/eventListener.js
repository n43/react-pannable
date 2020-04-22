let addEventListener = function () {};
let removeEventListener = function () {};

if (typeof window !== undefined) {
  addEventListener = function (target, ...args) {
    if (target && target.addEventListener) {
      return target.addEventListener.apply(target, args);
    }
  };
  removeEventListener = function (target, ...args) {
    if (target && target.removeEventListener) {
      return target.removeEventListener.apply(target, args);
    }
  };
}

export { addEventListener, removeEventListener };
