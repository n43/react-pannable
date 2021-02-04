import { Size, Rect } from '../interfaces';
import React from 'react';

export type PadContextType = {
  width: number | null;
  height: number | null;
  visibleRect: Rect;
  onResize: (size: Size) => void;
};

export default React.createContext<PadContextType>({
  width: null,
  height: null,
  visibleRect: { x: 0, y: 0, width: 0, height: 0 },
  onResize: () => {},
});
