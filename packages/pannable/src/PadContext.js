import React from 'react';

export default React.createContext({
  visibleRect: { x: 0, y: 0, width: 0, height: 0 },
  onContentResize: () => {},
});
