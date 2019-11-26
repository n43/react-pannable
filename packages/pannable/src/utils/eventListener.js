let addEventListener = function() {};
let removeEventListener = function() {};

if (typeof window !== undefined) {
  addEventListener = window.addEventListener;
  removeEventListener = window.removeEventListener;
}

export { addEventListener, removeEventListener };
