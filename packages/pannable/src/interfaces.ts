export type Time = number;
export type XY = 'x' | 'y';
export type RC = 'row' | 'column';
export type WH = 'width' | 'height';
export type LT = 'left' | 'top';
export type RB = 'right' | 'bottom';
export type Align = number | 'start' | 'center' | 'end' | 'auto';
export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
/* -1: 有弹性; 0: 没弹性; 1: 无边界; */
export type Bound = -1 | 0 | 1;
export type Inset = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export interface Action<P = any> {
  type: string;
  payload?: P;
}
