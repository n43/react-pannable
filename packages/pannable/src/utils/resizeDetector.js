import elementResizeDetectorMaker from 'element-resize-detector';

let detector = null;

if (typeof window !== 'undefined') {
  detector = elementResizeDetectorMaker({ strategy: 'scroll' });
}

export default detector;
