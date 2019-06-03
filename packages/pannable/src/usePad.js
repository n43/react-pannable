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
  const size = { width, height };
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [data, setData] = useState({
    contentOffset: { x: 0, y: 0 },
    contentVelocity: { x: 0, y: 0 },
    drag: null,
    deceleration: null,
  });
  const eventRef = useRef({ data });

  eventRef.current.onScroll = onScroll;
  eventRef.current.onDragStart = onDragStart;
  eventRef.current.onDragEnd = onDragEnd;
  eventRef.current.onDecelerationStart = onDecelerationStart;
  eventRef.current.onDecelerationEnd = onDecelerationEnd;
  eventRef.current.onContentResize = onContentResize;
  eventRef.current.shouldStart = pannableProps.shouldStart;
  eventRef.current.onStart = pannableProps.onStart;
  eventRef.current.onMove = pannableProps.onMove;
  eventRef.current.onEnd = pannableProps.onEnd;
  eventRef.current.onCancel = pannableProps.onCancel;

  const { contentOffset, contentVelocity, drag, deceleration } = data;

  const visibleRect = {
    x: -data.contentOffset.x,
    y: -data.contentOffset.y,
    width: size.width,
    height: size.height,
  };

  const shouldPannableStart = useCallback(
    evt => {
      const { velocity } = evt;

      if (
        directionalLockEnabled &&
        !shouldDragStart(velocity, size, contentSize)
      ) {
        return false;
      }

      const { shouldStart } = eventRef.current;

      if (shouldStart) {
        return shouldStart(evt);
      }

      return true;
    },
    [directionalLockEnabled, size, contentSize]
  );

  const onPannableStart = useCallback(
    evt => {
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

      const { onStart } = eventRef.current;

      onStart && onStart(evt);
    },
    [directionalLockEnabled]
  );

  const onPannableMove = useCallback(
    evt => {
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

      const { onMove } = eventRef.current;

      onMove && onMove(evt);
    },
    [alwaysBounceX, alwaysBounceY, size, contentSize]
  );

  const onPannableEnd = useCallback(
    evt => {
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

      const { onEnd } = eventRef.current;

      onEnd && onEnd(evt);
    },
    [pagingEnabled, size]
  );

  const onPannableCancel = useCallback(
    evt => {
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

      const { onCancel } = eventRef.current;

      onCancel && onCancel(evt);
    },
    [pagingEnabled, size]
  );

  const decelerate = useCallback(() => {
    setData(prevData => {
      const { deceleration } = prevData;

      if (!deceleration) {
        return prevData;
      }

      const moveTime = new Date().getTime();

      if (deceleration.startTime + deceleration.duration <= moveTime) {
        return {
          contentOffset: deceleration.endOffset,
          contentVelocity: { x: 0, y: 0 },
          drag: null,
          deceleration: null,
        };
      }

      const { xOffset, yOffset, xVelocity, yVelocity } = calculateDeceleration(
        deceleration,
        moveTime
      );

      return {
        contentOffset: { x: xOffset, y: yOffset },
        contentVelocity: { x: xVelocity, y: yVelocity },
        drag: null,
        deceleration,
      };
    });
  }, []);

  useEffect(() => {
    eventRef.current.onContentResize(contentSize);
  }, [contentSize]);

  useEffect(() => {
    const {
      data: prevData,
      onScroll,
      onDragStart,
      onDragEnd,
      onDecelerationStart,
      onDecelerationEnd,
    } = eventRef.current;
    const { contentOffset, contentVelocity, drag, deceleration } = data;

    eventRef.current.data = data;

    const output = {
      contentOffset,
      contentVelocity,
      dragging: !!drag,
      decelerating: !!deceleration,
    };

    if (contentOffset !== prevData.contentOffset) {
      onScroll(output);
    }
    if (drag !== prevData.drag) {
      if (!prevData.drag) {
        onDragStart(output);
      } else if (!drag) {
        onDragEnd(output);
      }
    }
    if (deceleration !== prevData.deceleration) {
      if (!prevData.deceleration) {
        onDecelerationStart(output);
      } else if (!deceleration) {
        onDecelerationEnd(output);
      }
    }

    if (deceleration) {
      const timer = requestAnimationFrame(() => decelerate());

      return () => cancelAnimationFrame(timer);
    }
  }, [data, decelerate]);

  const decelerationRate = DECELERATION_RATE_STRONG;

  if (deceleration) {
    let decelerationEndOffset = deceleration.endOffset;

    if (
      decelerationEndOffset !==
        getAdjustedContentOffset(
          decelerationEndOffset,
          size,
          contentSize,
          pagingEnabled,
          true
        ) &&
      contentOffset !==
        getAdjustedContentOffset(
          contentOffset,
          size,
          contentSize,
          pagingEnabled,
          true
        )
    ) {
      let nextContentVelocity = contentVelocity;

      if (deceleration.rate !== decelerationRate) {
        nextContentVelocity = getAdjustedContentVelocity(
          nextContentVelocity,
          size,
          decelerationRate
        );
        decelerationEndOffset = getDecelerationEndOffset(
          contentOffset,
          nextContentVelocity,
          size,
          pagingEnabled,
          decelerationRate
        );
      }

      decelerationEndOffset = getAdjustedContentOffset(
        decelerationEndOffset,
        size,
        contentSize,
        pagingEnabled,
        true
      );

      setData({
        contentOffset: { ...contentOffset },
        contentVelocity: nextContentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          nextContentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      });
    }
  } else if (!drag) {
    const adjustedContentOffset = getAdjustedContentOffset(
      contentOffset,
      size,
      contentSize,
      pagingEnabled
    );

    if (contentOffset !== adjustedContentOffset) {
      const decelerationEndOffset = getDecelerationEndOffset(
        adjustedContentOffset,
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        decelerationRate
      );

      setData({
        contentOffset: { ...contentOffset },
        contentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      });
    }
  }

  pannableProps.shouldStart = shouldPannableStart;
  pannableProps.onStart = onPannableStart;
  pannableProps.onMove = onPannableMove;
  pannableProps.onEnd = onPannableEnd;
  pannableProps.onCancel = onPannableCancel;

  const [props] = usePannable(pannableProps);

  props.style = {
    overflow: 'hidden',
    position: 'relative',
    width: size.width,
    height: size.height,
    ...props.style,
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

  return [props];
}
