import createElementResizeDetector from 'element-resize-detector';

let detector: createElementResizeDetector.Erd;

export function getResizeDetector() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!detector) {
    detector = createElementResizeDetector({ strategy: 'scroll' });
  }

  return detector;
};
