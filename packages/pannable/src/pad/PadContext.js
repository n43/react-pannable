import React from 'react';

export default React.createContext({
  width: null,
  height: null,
  visibleRect: { top: 0, left: 0, width: 0, height: 0 },
  onResize: () => {},
});
