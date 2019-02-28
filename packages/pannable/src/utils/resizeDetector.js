import createResizeDetector from 'element-resize-detector';

let detector = null;

export default function createDetector() {
  if (detector) {
    return { addResizeListener, removeResizeListener };
  }

  detector = createResizeDetector({
    strategy: 'scroll',
  });

  return { addResizeListener, removeResizeListener };
}

function addResizeListener(element, callback) {
  detector.listenTo(element, callback);
}

function removeResizeListener(element) {
  detector.uninstall(element);
}
