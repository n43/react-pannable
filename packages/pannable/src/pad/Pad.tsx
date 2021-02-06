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
  onScroll?: (evt: PadEvent) => void;
  onStartDragging?: (evt: PadEvent) => void;
  onEndDragging?: (evt: PadEvent) => void;
  onStartDecelerating?: (evt: PadEvent) => void;
  onEndDecelerating?: (evt: PadEvent) => void;
  OnResizeContent?: (evt: Size) => void;
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
  onScroll: () => {},
  onStartDragging: () => {},
  onEndDragging: () => {},
  onStartDecelerating: () => {},
  onEndDecelerating: () => {},
  OnResizeContent: () => {},
  renderBackground: () => null,
  renderOverlay: () => null,
  scrollTo: null,
  ...defaultPannableProps,
};

const Pad: React.FC<PadProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>> = React.memo(
  props => {
    const {
      width,
      height,
      pagingEnabled,
      directionalLockEnabled,
      alwaysBounceX,
      alwaysBounceY,
      isBoundlessX,
      isBoundlessY,
      onScroll,
      onStartDragging,
      onEndDragging,
      onStartDecelerating,
      onEndDecelerating,
      OnResizeContent,
      renderBackground,
      renderOverlay,
      scrollTo,
      children,
      ...pannableProps
    } = props as Required<PadProps> &
      Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>;
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
    const delegate = { shouldStart: pannableProps.shouldStart };
    const delegateRef = useRef(delegate);
    delegateRef.current = delegate;

    const pannableShouldStart = useCallback(evt => {
      const state = stateRef.current;

      if (!state) {
        return false;
      }
      if (!shouldStartDrag(evt.velocity, state.size, state.contentSize)) {
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
            pagingEnabled={pagingEnabled}
            directionalLockEnabled={directionalLockEnabled}
            alwaysBounce={alwaysBounce}
            isBoundless={isBoundless}
            onScroll={onScroll}
            onStartDragging={onStartDragging}
            onEndDragging={onEndDragging}
            onStartDecelerating={onStartDecelerating}
            onEndDecelerating={onEndDecelerating}
            OnResizeContent={OnResizeContent}
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
  }
);

Pad.defaultProps = defaultPadProps;

export default Pad;

function shouldStartDrag(velocity: Point, size: Size, cSize: Size): boolean {
  const height =
    Math.abs(velocity.y) < Math.abs(velocity.x) ? 'width' : 'height';

  return size[height] < cSize[height];
}
