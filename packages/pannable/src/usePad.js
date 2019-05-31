import {
  isValidElement,
  createElement,
  cloneElement,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { usePannable } from './usePannable';
import PadContext from './PadContext';
import GeneralContent from './GeneralContent';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import {
  getAdjustedContentVelocity,
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  shouldDragStart,
  createDeceleration,
  calculateDeceleration,
  calculateRectOffset,
} from './utils/motion';

const DECELERATION_RATE_STRONG = 0.025;
const DECELERATION_RATE_WEAK = 0.0025;

export const defaultPadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  onScroll: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onDecelerationStart: () => {},
  onDecelerationEnd: () => {},
  onContentResize: () => {},
};

export function usePad({
  width = defaultPadProps.width,
  height = defaultPadProps.height,
  pagingEnabled = defaultPadProps.pagingEnabled,
  directionalLockEnabled = defaultPadProps.directionalLockEnabled,
  alwaysBounceX = defaultPadProps.alwaysBounceX,
  alwaysBounceY = defaultPadProps.alwaysBounceY,
  onScroll = defaultPadProps.onScroll,
  onDragStart = defaultPadProps.onDragStart,
  onDragEnd = defaultPadProps.onDragEnd,
  onDecelerationStart = defaultPadProps.onDecelerationStart,
  onDecelerationEnd = defaultPadProps.onDecelerationEnd,
  onContentResize = defaultPadProps.onContentResize,
  ...pannableProps
}) {
  const { shouldStart, onStart, onMove, onEnd, onCancel } = pannableProps;

  pannableProps.shouldStart = evt => {
    const { velocity } = evt;

    if (
      directionalLockEnabled &&
      !shouldDragStart(velocity, size, contentSize)
    ) {
      return false;
    }
    if (shouldStart) {
      return shouldStart(evt);
    }

    return true;
  };

  pannableProps.onStart = evt => {
    const { velocity } = evt;

    setData(prevData => {
      const { contentOffset } = prevData;

      const dragDirection = !directionalLockEnabled
        ? { x: 1, y: 1 }
        : Math.abs(velocity.x) > Math.abs(velocity.y)
        ? { x: 1, y: 0 }
        : { x: 0, y: 1 };
      const contentVelocity = {
        x: dragDirection.x * velocity.x,
        y: dragDirection.y * velocity.y,
      };

      return {
        contentOffset: { ...contentOffset },
        contentVelocity,
        drag: {
          direction: dragDirection,
          startOffset: contentOffset,
        },
        deceleration: null,
      };
    });

    onStart && onStart(evt);
  };

  pannableProps.onMove = evt => {
    const { translation, interval } = evt;

    setData(prevData => {
      const { contentOffset, drag } = prevData;

      const nextContentOffset = getAdjustedBounceOffset(
        {
          x: drag.startOffset.x + drag.direction.x * translation.x,
          y: drag.startOffset.y + drag.direction.y * translation.y,
        },
        { x: alwaysBounceX, y: alwaysBounceY },
        size,
        contentSize
      );
      const contentVelocity = {
        x: (nextContentOffset.x - contentOffset.x) / interval,
        y: (nextContentOffset.y - contentOffset.y) / interval,
      };

      return {
        contentOffset: nextContentOffset,
        contentVelocity,
        drag,
        deceleration: null,
      };
    });

    onMove && onMove(evt);
  };

  pannableProps.onEnd = evt => {
    setData(prevData => {
      const { contentOffset, contentVelocity } = prevData;

      let decelerationRate = DECELERATION_RATE_WEAK;
      let nextContentVelocity = contentVelocity;

      if (pagingEnabled) {
        decelerationRate = DECELERATION_RATE_STRONG;
        nextContentVelocity = getAdjustedContentVelocity(
          nextContentVelocity,
          size,
          decelerationRate
        );
      }

      const decelerationEndOffset = getDecelerationEndOffset(
        contentOffset,
        nextContentVelocity,
        size,
        pagingEnabled,
        decelerationRate
      );

      return {
        contentOffset: { ...contentOffset },
        contentVelocity: nextContentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          nextContentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      };
    });

    onEnd && onEnd(evt);
  };

  pannableProps.onCancel = evt => {
    setData(prevData => {
      const { contentOffset, contentVelocity, drag } = prevData;

      const decelerationEndOffset = getDecelerationEndOffset(
        drag.startOffset,
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        DECELERATION_RATE_STRONG
      );

      return {
        contentOffset: { ...contentOffset },
        contentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          DECELERATION_RATE_STRONG
        ),
      };
    });

    onCancel && onCancel(evt);
  };

  const [props] = usePannable(pannableProps);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [data, setData] = useState({
    contentOffset: { x: 0, y: 0 },
    contentVelocity: { x: 0, y: 0 },
    drag: null,
    deceleration: null,
  });
  const size = { width, height };
  const { contentOffset, contentVelocity, drag, deceleration } = data;

  const visibleRect = {
    x: -data.contentOffset.x,
    y: -data.contentOffset.y,
    width: size.width,
    height: size.height,
  };

  let contentStyle = StyleSheet.create({
    position: 'relative',
    width: contentSize.width,
    height: contentSize.height,
    transformTranslate: [contentOffset.x, contentOffset.y],
    willChange: 'transform',
  });

  let element = props.children;

  if (isValidElement(element) && element.type.contextType === PadContext) {
    contentStyle = { ...contentStyle, ...element.props.style };

    element = cloneElement(element, { style: contentStyle, ref: element.ref });
  } else {
    element = createElement(GeneralContent, { style: contentStyle }, element);
  }

  props.children = createElement(
    PadContext.Provider,
    {
      visibleRect,
      value: { onContentResize: contentSize => setContentSize(contentSize) },
    },
    element
  );
  props.style = {
    overflow: 'hidden',
    position: 'relative',
    width: size.width,
    height: size.height,
    ...props.style,
  };

  return [props];
}
