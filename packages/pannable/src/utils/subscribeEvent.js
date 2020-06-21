export default function subscribeEvent(target, ...args) {
  let unsubscribe = function() {};

  if (target && target.addEventListener) {
    target.addEventListener.apply(target, args);

    unsubscribe = function() {
      target.removeEventListener.apply(target, args);
    };
  }

  return unsubscribe;
}
