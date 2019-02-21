export function getElementSize(element) {
  if (!element) {
    return { width: 0, height: 0 };
  }

  const width = element.offsetWidth || 0;
  const height = element.offsetHeight || 0;
  const styles = window.getComputedStyle(element) || {};

  const paddingLeft = parseInt(styles.paddingLeft, 10) || 0;
  const paddingRight = parseInt(styles.paddingRight, 10) || 0;
  const paddingTop = parseInt(styles.paddingTop, 10) || 0;
  const paddingBottom = parseInt(styles.paddingBottom, 10) || 0;

  const realHeight = height - paddingTop - paddingBottom;
  const realWidth = width - paddingLeft - paddingRight;

  return { width: realWidth, height: realHeight };
}

export function getElementScrollSize(element) {
  if (!element) {
    return { width: 0, height: 0 };
  }

  const width = element.scrollWidth || 0;
  const height = element.scrollHeight || 0;

  return { width, height };
}

// function addResizeListener(element, fn) {
//   if (attachEvent) {
//     element.attachEvent('onresize', fn);
//   } else {
//     if (!element.__resizeTriggers__) {
//       var doc = element.ownerDocument;
//       var elementStyle = _window.getComputedStyle(element);
//       if (elementStyle && elementStyle.position == 'static') {
//         element.style.position = 'relative';
//       }
//       createStyles(doc);
//       element.__resizeLast__ = {};
//       element.__resizeListeners__ = [];
//       (element.__resizeTriggers__ = doc.createElement('div')).className =
//         'resize-triggers';
//       element.__resizeTriggers__.innerHTML =
//         '<div class="expand-trigger"><div></div></div>' +
//         '<div class="contract-trigger"></div>';
//       element.appendChild(element.__resizeTriggers__);
//       resetTriggers(element);
//       element.addEventListener('scroll', scrollListener, true);

//       /* Listen for a css animation to detect element display/re-attach */
//       if (animationstartevent) {
//         element.__resizeTriggers__.__animationListener__ = function animationListener(
//           e,
//         ) {
//           if (e.animationName == animationName) {
//             resetTriggers(element);
//           }
//         };
//         element.__resizeTriggers__.addEventListener(
//           animationstartevent,
//           element.__resizeTriggers__.__animationListener__,
//         );
//       }
//     }
//     element.__resizeListeners__.push(fn);
//   }
// };

// function removeResizeListener(element, fn) {
//   if (attachEvent) {
//     element.detachEvent('onresize', fn);
//   } else {
//     element.__resizeListeners__.splice(
//       element.__resizeListeners__.indexOf(fn),
//       1,
//     );
//     if (!element.__resizeListeners__.length) {
//       element.removeEventListener('scroll', scrollListener, true);
//       if (element.__resizeTriggers__.__animationListener__) {
//         element.__resizeTriggers__.removeEventListener(
//           animationstartevent,
//           element.__resizeTriggers__.__animationListener__,
//         );
//         element.__resizeTriggers__.__animationListener__ = null;
//       }
//       try {
//         element.__resizeTriggers__ = !element.removeChild(
//           element.__resizeTriggers__,
//         );
//       } catch (e) {
//         // Preact compat; see developit/preact-compat/issues/228
//       }
//     }
//   }
// };
