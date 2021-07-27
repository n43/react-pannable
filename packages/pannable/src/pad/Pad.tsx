import { PadState, PadEvent, PadMethods, PadScrollTo } from './padReducer';
import PadInner from './PadInner';
import { XY, WH, LT, RB, Point, Size, Bound, Inset } from '../interfaces';
import Pannable, { defaultPannableProps, PannableProps } from '../Pannable';
import React, { useMemo, useCallback, useRef } from 'react';
import { PannableState } from 'pannableReducer';

export interface PadProps extends PannableProps {
  width: number;
  height: number;
  pagingEnabled?: boolean;
  directionalLockEnabled?: boolean;
  boundX?: Bound;
  boundY?: Bound;
  contentInsetTop?: number;
  contentInsetRight?: number;
  contentInsetBottom?: number;
  contentInsetLeft?: number;
  onScroll?: (evt: PadEvent) => void;
  onStartDragging?: (evt: PadEvent) => void;
  onEndDragging?: (evt: PadEvent) => void;
  onStartDecelerating?: (evt: PadEvent) => void;
  onEndDecelerating?: (evt: PadEvent) => void;
  onResizeContent?: (evt: Size) => void;
  renderBackground?: (state: PadState, methods: PadMethods) => React.ReactNode;
  renderOverlay?: (state: PadState, methods: PadMethods) => React.ReactNode;
  scrollTo?: PadScrollTo | null;
}

export const defaultPadProps: PadProps = {
  width: 0,
  height: 0,
  boundX: 1,
  boundY: 1,
  contentInsetTop: 0,
  contentInsetRight: 0,
  contentInsetBottom: 0,
  contentInsetLeft: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  onScroll: () => {},
  onStartDragging: () => {},
  onEndDragging: () => {},
  onStartDecelerating: () => {},
  onEndDecelerating: () => {},
  onResizeContent: () => {},
  renderBackground: () => null,
  renderOverlay: () => null,
  scrollTo: null,
  ...defaultPannableProps,
};

const Pad: React.FC<
  PadProps & Omit<React.ComponentProps<'div'>, 'onScroll'>
> = React.memo((props) => {
  const {
    width,
    height,
    boundX,
    boundY,
    contentInsetTop,
    contentInsetRight,
    contentInsetBottom,
    contentInsetLeft,
    pagingEnabled,
    directionalLockEnabled,
    onScroll,
    onStartDragging,
    onEndDragging,
    onStartDecelerating,
    onEndDecelerating,
    onResizeContent,
    renderBackground,
    renderOverlay,
    scrollTo,
    children,
    ...pannableProps
  } = props as Required<PadProps> &
    Omit<React.ComponentProps<'div'>, 'onScroll'>;
  const size = useMemo(() => ({ width, height }), [width, height]);
  const bound = useMemo(() => ({ x: boundX, y: boundY }), [boundX, boundY]);
  const contentInset = useMemo(
    () => ({
      top: contentInsetTop,
      right: contentInsetRight,
      bottom: contentInsetBottom,
      left: contentInsetLeft,
    }),
    [contentInsetTop, contentInsetRight, contentInsetBottom, contentInsetLeft]
  );
  const stateRef = useRef<PadState>();
  const delegate = { shouldStart: pannableProps.shouldStart };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const pannableShouldStart = useCallback((evt) => {
    const state = stateRef.current;

    if (!state) {
      return false;
    }
    if (
      !shouldStartDrag(
        evt.velocity,
        state.size,
        state.contentSize,
        state.contentInset,
        state.bound
      )
    ) {
      return false;
    }

    return delegateRef.current.shouldStart(evt);
  }, []);

  const pannableStyle = useMemo(() => {
    const style: React.CSSProperties = {
      overflow: 'hidden',
      position: 'relative',
      width: size.width,
      height: size.height,
    };

    if (pannableProps.style) {
      Object.assign(style, pannableProps.style);
    }

    return style;
  }, [size, pannableProps.style]);

  pannableProps.shouldStart = pannableShouldStart;
  pannableProps.style = pannableStyle;

  return (
    <Pannable {...pannableProps}>
      {(pannable: PannableState) => (
        <PadInner
          pannable={pannable}
          size={size}
          bound={bound}
          contentInset={contentInset}
          pagingEnabled={pagingEnabled}
          directionalLockEnabled={directionalLockEnabled}
          onScroll={onScroll}
          onStartDragging={onStartDragging}
          onEndDragging={onEndDragging}
          onStartDecelerating={onStartDecelerating}
          onEndDecelerating={onEndDecelerating}
          onResizeContent={onResizeContent}
          renderBackground={renderBackground}
          renderOverlay={renderOverlay}
          scrollTo={scrollTo}
        >
          {(state: PadState, methods: PadMethods) => {
            stateRef.current = state;

            return typeof children === 'function'
              ? children(state, methods)
              : children;
          }}
        </PadInner>
      )}
    </Pannable>
  );
});

Pad.defaultProps = defaultPadProps;

export default Pad;

function shouldStartDrag(
  velocity: Point,
  size: Size,
  cSize: Size,
  cInset: Inset,
  bound: Record<XY, Bound>
): boolean {
  const [x, width, left, right]: [XY, WH, LT, RB] =
    Math.abs(velocity.y) < Math.abs(velocity.x)
      ? ['x', 'width', 'left', 'right']
      : ['y', 'height', 'top', 'bottom'];

  if (bound[x] !== 0) {
    return true;
  }

  return size[width] < cInset[left] + cSize[width] + cInset[right];
}
