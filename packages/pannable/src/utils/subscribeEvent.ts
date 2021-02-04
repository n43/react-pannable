export default function subscribeEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  let unsubscribe = function() {};

  if (target && target.addEventListener) {
    target.addEventListener(type, listener, options);

    unsubscribe = function() {
      target.removeEventListener(type, listener, options);
    };
  }

  return unsubscribe;
}
