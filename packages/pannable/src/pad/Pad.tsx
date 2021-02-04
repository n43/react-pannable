import { PadState, PadEvent, PadMethods, PadScrollTo } from './padReducer';
import PadInner from './PadInner';
import { Point, Size } from '../interfaces';
import Pannable, { defaultPannableProps, PannableProps } from '../Pannable';
import React, { useMemo, useCallback, useRef } from 'react';
import { PannableState } from 'pannableReducer';

export interface PadProps extends PannableProps {
  width: number;
  height: number;
  pagingEnabled?: boolean;
  directionalLockEnabled?: boolean;
  alwaysBounceX?: boolean;
  alwaysBounceY?: boolean;
  isBoundlessX?: boolean;
  isBoundlessY?: boolean;
  padOnScroll?: (evt: PadEvent) => void;
  dragOnStart?: (evt: PadEvent) => void;
  dragOnEnd?: (evt: PadEvent) => void;
  decelerationOnStart?: (evt: PadEvent) => void;
  decelerationOnEnd?: (evt: PadEvent) => void;
  contentOnResize?: (evt: Size) => void;
  renderBackground?: (state: PadState, methods: PadMethods) => React.ReactNode;
  renderOverlay?: (state: PadState, methods: PadMethods) => React.ReactNode;
  scrollTo?: PadScrollTo | null;
}

export const defaultPadProps: PadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  isBoundlessX: false,
  isBoundlessY: false,
  padOnScroll: () => {},
  dragOnStart: () => {},
  dragOnEnd: () => {},
  decelerationOnStart: () => {},
  decelerationOnEnd: () => {},
  contentOnResize: () => {},
  renderBackground: () => null,
  renderOverlay: () => null,
  scrollTo: null,
  ...defaultPannableProps,
};

const Pad: React.FC<PadProps &
  React.HTMLAttributes<HTMLDivElement>> = React.memo(props => {
  const {
    width,
    height,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounceX,
    alwaysBounceY,
    isBoundlessX,
    isBoundlessY,
    padOnScroll,
    dragOnStart,
    dragOnEnd,
    decelerationOnStart,
    decelerationOnEnd,
    contentOnResize,
    renderBackground,
    renderOverlay,
    scrollTo,
    children,
    ...pannableProps
  } = props as Required<PadProps> & React.HTMLAttributes<HTMLDivElement>;
  const size = useMemo(() => ({ width, height }), [width, height]);
  const alwaysBounce = useMemo(
    () => ({
      x: alwaysBounceX,
      y: alwaysBounceY,
    }),
    [alwaysBounceX, alwaysBounceY]
  );
  const isBoundless = useMemo(
    () => ({
      x: isBoundlessX,
      y: isBoundlessY,
    }),
    [isBoundlessX, isBoundlessY]
  );
  const stateRef = useRef<PadState>();
  const response = { shouldStart: pannableProps.shouldStart };
  const responseRef = useRef(response);
  responseRef.current = response;

  const pannableShouldStart = useCallback(evt => {
    const state = stateRef.current;

    if (!state) {
      return false;
    }
    if (!shouldStartDrag(evt.velocity, state.size, state.contentSize)) {
      return false;
    }

    return responseRef.current.shouldStart(evt);
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
          pagingEnabled={pagingEnabled}
          directionalLockEnabled={directionalLockEnabled}
          alwaysBounce={alwaysBounce}
          isBoundless={isBoundless}
          onScroll={padOnScroll}
          dragOnStart={dragOnStart}
          dragOnEnd={dragOnEnd}
          decelerationOnStart={decelerationOnStart}
          decelerationOnEnd={decelerationOnEnd}
          contentOnResize={contentOnResize}
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

function shouldStartDrag(velocity: Point, size: Size, cSize: Size): boolean {
  const height =
    Math.abs(velocity.y) < Math.abs(velocity.x) ? 'width' : 'height';

  return size[height] < cSize[height];
}
