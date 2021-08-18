import { Size, Rect } from '../interfaces';
import React from 'react';

export type PadContextType = {
  width?: number;
  height?: number;
  visibleRect: Rect;
  onResize: (size: Size) => void;
};

export const context = React.createContext<PadContextType>({
  visibleRect: { x: 0, y: 0, width: 0, height: 0 },
  onResize: () => {},
});

export default context;
