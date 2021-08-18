import { PadState, PadEvent, PadMethods, PadScrollTo } from './padReducer';
import PadInner from './PadInner';
import { PannableState } from '../pannableReducer';
import Pannable, { PannableEvent } from '../Pannable';
import { XY, WH, LT, RB, Point, Size, Bound, Inset } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useMemo, useCallback, useRef } from 'react';

export interface PadProps {
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
  render?: (state: PadState, methods: PadMethods) => React.ReactNode;
  scrollTo?: PadScrollTo;
}

export const Pad = React.memo<
  Omit<React.ComponentProps<typeof Pannable>, 'onScroll' | 'render'> & PadProps
>((props) => {
  const {
    width,
    height,
    boundX = 1,
    boundY = 1,
    contentInsetTop = 0,
    contentInsetRight = 0,
    contentInsetBottom = 0,
    contentInsetLeft = 0,
    pagingEnabled = false,
    directionalLockEnabled = false,
    onScroll,
    onStartDragging,
    onEndDragging,
    onStartDecelerating,
    onEndDecelerating,
    onResizeContent,
    renderBackground,
    renderOverlay,
    render,
    scrollTo,
    children,
    ...pannableProps
  } = props;
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
  const methodsRef = useRef<PadMethods>();
  const delegate = { shouldStart: pannableProps.shouldStart };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const pannableShouldStart = useCallback((evt: PannableEvent) => {
    if (delegateRef.current.shouldStart) {
      return delegateRef.current.shouldStart(evt);
    }

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

    return true;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (scrollTo) {
      const methods = methodsRef.current;

      if (methods) {
        methods.scrollTo(scrollTo);
      }
    }
  }, [scrollTo]);

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

  pannableProps.style = pannableStyle;
  pannableProps.shouldStart = pannableShouldStart;

  return (
    <Pannable
      {...pannableProps}
      render={(pannable: PannableState) => (
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
          render={(state, methods) => {
            stateRef.current = state;
            methodsRef.current = methods;

            return render ? render(state, methods) : children;
          }}
        />
      )}
    />
  );
});

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
