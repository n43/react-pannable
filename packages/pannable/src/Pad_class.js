import React from 'react';
import Pannable from './Pannable';
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

export default class Pad extends React.Component {
  static defaultProps = {
    ...Pannable.defaultProps,
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

  state = {
    contentOffset: { x: 0, y: 0 },
    contentVelocity: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    contentSize: { width: 0, height: 0 },
    drag: null,
    deceleration: null,
  };

  static getDerivedStateFromProps(props, state) {
    const { width, height, pagingEnabled } = props;
    const {
      contentOffset,
      contentVelocity,
      size,
      contentSize,
      drag,
      deceleration,
    } = state;

    let nextSize = size;
    let nextContentOffset = contentOffset;
    let nextContentVelocity = contentVelocity;
    let nextDeceleration = deceleration;

    const decelerationRate = DECELERATION_RATE_STRONG;

    if (width !== nextSize.width || height !== nextSize.height) {
      nextSize = { width, height };
    }

    if (nextDeceleration) {
      let decelerationEndOffset = nextDeceleration.endOffset;

      if (
        decelerationEndOffset !==
          getAdjustedContentOffset(
            decelerationEndOffset,
            nextSize,
            contentSize,
            pagingEnabled,
            true
          ) &&
        nextContentOffset !==
          getAdjustedContentOffset(
            nextContentOffset,
            nextSize,
            contentSize,
            pagingEnabled,
            true
          )
      ) {
        if (nextDeceleration.rate !== decelerationRate) {
          nextContentVelocity = getAdjustedContentVelocity(
            nextContentVelocity,
            nextSize,
            decelerationRate
          );
          decelerationEndOffset = getDecelerationEndOffset(
            nextContentOffset,
            nextContentVelocity,
            nextSize,
            pagingEnabled,
            decelerationRate
          );
        }

        decelerationEndOffset = getAdjustedContentOffset(
          decelerationEndOffset,
          nextSize,
          contentSize,
          pagingEnabled,
          true
        );

        nextDeceleration = createDeceleration(
          nextContentOffset,
          nextContentVelocity,
          decelerationEndOffset,
          decelerationRate
        );

        nextContentOffset = { ...nextContentOffset };
      }
    } else if (!drag) {
      const adjustedContentOffset = getAdjustedContentOffset(
        nextContentOffset,
        nextSize,
        contentSize,
        pagingEnabled
      );

      if (nextContentOffset !== adjustedContentOffset) {
        const decelerationEndOffset = getDecelerationEndOffset(
          adjustedContentOffset,
          { x: 0, y: 0 },
          nextSize,
          pagingEnabled,
          decelerationRate
        );

        nextDeceleration = createDeceleration(
          nextContentOffset,
          nextContentVelocity,
          decelerationEndOffset,
          decelerationRate
        );

        nextContentOffset = { ...nextContentOffset };
      }
    }

    let nextState = null;

    if (nextSize !== size) {
      nextState = nextState || {};
      nextState.size = nextSize;
    }
    if (nextContentOffset !== contentOffset) {
      nextState = nextState || {};
      nextState.contentOffset = nextContentOffset;
    }
    if (nextContentVelocity !== contentVelocity) {
      nextState = nextState || {};
      nextState.contentVelocity = nextContentVelocity;
    }
    if (nextDeceleration !== deceleration) {
      nextState = nextState || {};
      nextState.deceleration = nextDeceleration;
    }

    return nextState;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      onScroll,
      onDragStart,
      onDragEnd,
      onDecelerationStart,
      onDecelerationEnd,
      onContentResize,
    } = this.props;
    const { contentOffset, contentSize, drag, deceleration } = this.state;

    if (contentOffset !== prevState.contentOffset) {
      onScroll(this._getPadEvent());

      if (deceleration) {
        this._requestDecelerationTimer();
      }
    }
    if (contentSize !== prevState.contentSize) {
      onContentResize(contentSize);
    }
    if (drag !== prevState.drag) {
      if (!prevState.drag) {
        onDragStart(this._getPadEvent());
      } else if (!drag) {
        onDragEnd(this._getPadEvent());
      }
    }
    if (deceleration !== prevState.deceleration) {
      if (!prevState.deceleration) {
        onDecelerationStart(this._getPadEvent());
      } else if (!deceleration) {
        onDecelerationEnd(this._getPadEvent());
      }
    }
  }

  componentWillUnmount() {
    this._cancelDecelerationTimer();
  }

  getSize() {
    return this.state.size;
  }
  getContentSize() {
    return this.state.contentSize;
  }
  getContentOffset() {
    return this.state.contentOffset;
  }
  getContentVelocity() {
    return this.state.contentVelocity;
  }
  isDragging() {
    return !!this.state.drag;
  }
  isDecelerating() {
    return !!this.state.deceleration;
  }

  scrollToRect({ rect, align = 'auto', animated = true }) {
    this._setContentOffset(
      state => calculateRectOffset(rect, this._getVisibleRect(state), align),
      animated
    );
  }

  scrollTo({ offset, animated = true }) {
    this._setContentOffset(offset, animated);
  }

  _getVisibleRect(state) {
    const { contentOffset, size } = state;

    return {
      x: -contentOffset.x,
      y: -contentOffset.y,
      width: size.width,
      height: size.height,
    };
  }

  _getPadEvent() {
    const {
      contentOffset,
      contentVelocity,
      size,
      contentSize,
      drag,
      deceleration,
    } = this.state;

    return {
      contentOffset,
      contentVelocity,
      size,
      contentSize,
      dragging: !!drag,
      decelerating: !!deceleration,
    };
  }

  _setContentOffset(offset, animated) {
    this.setState((state, props) => {
      if (typeof offset === 'function') {
        offset = offset(state, props);
      }

      if (!offset) {
        return null;
      }

      const {
        contentOffset,
        contentVelocity,
        size,
        drag,
        deceleration,
      } = state;
      const { pagingEnabled } = props;

      const nextState = {};

      if (drag || !animated) {
        if (offset.x === contentOffset.x && offset.y === contentOffset.y) {
          return null;
        }

        nextState.contentOffset = { ...offset };

        if (drag) {
          nextState.drag = {
            ...drag,
            startOffset: {
              x: drag.startOffset.x + offset.x - contentOffset.x,
              y: drag.startOffset.y + offset.y - contentOffset.y,
            },
          };
        }
        if (deceleration) {
          nextState.deceleration = createDeceleration(
            offset,
            contentVelocity,
            {
              x: deceleration.endOffset.x + offset.x - contentOffset.x,
              y: deceleration.endOffset.y + offset.y - contentOffset.y,
            },
            deceleration.rate
          );
        }
      } else {
        const decelerationEndOffset = getDecelerationEndOffset(
          offset,
          { x: 0, y: 0 },
          size,
          pagingEnabled,
          DECELERATION_RATE_STRONG
        );

        nextState.contentOffset = { ...contentOffset };
        nextState.deceleration = createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          DECELERATION_RATE_STRONG
        );
      }

      return nextState;
    });
  }

  _requestDecelerationTimer() {
    if (this._decelerationTimer) {
      cancelAnimationFrame(this._decelerationTimer);
    }

    this._decelerationTimer = requestAnimationFrame(() => {
      this._decelerationTimer = undefined;
      this._decelerate();
    });
  }

  _cancelDecelerationTimer() {
    if (!this._decelerationTimer) {
      return;
    }

    cancelAnimationFrame(this._decelerationTimer);
    this._decelerationTimer = undefined;
  }

  _decelerate() {
    this.setState(state => {
      const { deceleration } = state;

      if (!deceleration) {
        return null;
      }

      const moveTime = new Date().getTime();

      if (deceleration.startTime + deceleration.duration <= moveTime) {
        return {
          contentOffset: deceleration.endOffset,
          contentVelocity: { x: 0, y: 0 },
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
      };
    });
  }

  _shouldPanStart = evt => {
    const { velocity } = evt;
    const { directionalLockEnabled, shouldStart } = this.props;
    const { size, contentSize } = this.state;

    if (
      directionalLockEnabled &&
      !shouldDragStart(velocity, size, contentSize)
    ) {
      return false;
    }

    return shouldStart(evt);
  };

  _onPanStart = evt => {
    const { velocity } = evt;

    this.setState((state, props) => {
      const { contentOffset } = state;
      const { directionalLockEnabled } = props;

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

    this.props.onStart(evt);
  };

  _onPanMove = evt => {
    const { translation, interval } = evt;

    this.setState((state, props) => {
      const { contentOffset, size, contentSize, drag } = state;
      const { alwaysBounceX, alwaysBounceY } = props;

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

      return { contentOffset: nextContentOffset, contentVelocity };
    });

    this.props.onMove(evt);
  };

  _onPanEnd = evt => {
    this.setState((state, props) => {
      const { contentOffset, contentVelocity, size } = state;
      const { pagingEnabled } = props;

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

    this.props.onEnd(evt);
  };

  _onPanCancel = evt => {
    this.setState((state, props) => {
      const { contentOffset, contentVelocity, size, drag } = state;
      const { pagingEnabled } = props;

      const decelerationEndOffset = getDecelerationEndOffset(
        drag.startOffset,
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        DECELERATION_RATE_STRONG
      );

      return {
        contentOffset: { ...contentOffset },
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          DECELERATION_RATE_STRONG
        ),
      };
    });

    this.props.onCancel(evt);
  };

  render() {
    const {
      width,
      height,
      pagingEnabled,
      directionalLockEnabled,
      alwaysBounceX,
      alwaysBounceY,
      onScroll,
      onDragStart,
      onDragEnd,
      onDecelerationStart,
      onDecelerationEnd,
      onContentResize,
      ...props
    } = this.props;
    const { size, contentSize, contentOffset } = this.state;

    let contentStyle = StyleSheet.create({
      position: 'relative',
      width: contentSize.width,
      height: contentSize.height,
      transformTranslate: [contentOffset.x, contentOffset.y],
      willChange: 'transform',
    });
    let element = props.children;

    if (typeof element === 'function') {
      element = element(this.state);
    }
    if (
      !React.isValidElement(element) ||
      element.type.contextType !== PadContext
    ) {
      element = <GeneralContent style={contentStyle}>{element}</GeneralContent>;
    } else {
      contentStyle = { ...contentStyle, ...element.props.style };

      element = React.cloneElement(element, {
        ref: element.ref,
        style: contentStyle,
      });
    }

    props.shouldStart = this._shouldPanStart;
    props.onStart = this._onPanStart;
    props.onMove = this._onPanMove;
    props.onEnd = this._onPanEnd;
    props.onCancel = this._onPanCancel;
    props.style = {
      overflow: 'hidden',
      position: 'relative',
      width: size.width,
      height: size.height,
      ...props.style,
    };

    return (
      <Pannable {...props}>
        <PadContext.Provider
          value={{
            visibleRect: this._getVisibleRect(this.state),
            onContentResize: contentSize => this.setState({ contentSize }),
          }}
        >
          {element}
        </PadContext.Provider>
      </Pannable>
    );
  }
}
