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
  createDeceleration,
  calculateDeceleration,
  calculateRectOffset,
} from './utils/motion';

const DECELERATION_RATE_STRONG = 0.02;
const DECELERATION_RATE_WEAK = 0.002;

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

  elemRef = React.createRef();

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
    let nextState = null;
    let nextSize = size;
    let nextDeceleration = deceleration;
    const decelerationRate = DECELERATION_RATE_STRONG;

    if (width !== nextSize.width || height !== nextSize.height) {
      nextSize = { width, height };

      nextState = nextState || {};
      nextState.size = nextSize;
    }

    if (nextDeceleration) {
      if (
        contentOffset !==
        getAdjustedContentOffset(
          contentOffset,
          nextSize,
          contentSize,
          pagingEnabled,
          true
        )
      ) {
        let decelerationEndOffset = nextDeceleration.endOffset;

        if (nextDeceleration.rate !== decelerationRate) {
          decelerationEndOffset = getDecelerationEndOffset(
            contentOffset,
            contentVelocity,
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
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
        );
      }
    } else if (!drag) {
      const decelerationEndOffset = getAdjustedContentOffset(
        contentOffset,
        nextSize,
        contentSize,
        pagingEnabled
      );

      if (contentOffset !== decelerationEndOffset) {
        nextDeceleration = createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
        );
      }
    }

    if (nextDeceleration !== deceleration) {
      nextState = nextState || {};

      nextState.contentOffset = { ...contentOffset };
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
        contentSize,
        drag,
        deceleration,
      } = state;
      const { pagingEnabled } = props;
      const nextState = {};

      if (drag || !animated) {
        nextState.contentOffset = offset;

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
        const decelerationRate = DECELERATION_RATE_STRONG;
        const decelerationEndOffset = getAdjustedContentOffset(
          offset,
          size,
          contentSize,
          pagingEnabled
        );

        nextState.contentOffset = { ...contentOffset };
        nextState.deceleration = createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
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

  _onDragStart = ({ velocity }) => {
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
  };

  _onDragMove = ({ translation, interval }) => {
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
  };

  _onDragEnd = () => {
    this.setState((state, props) => {
      const { contentOffset, contentVelocity, size } = state;
      const { pagingEnabled } = props;

      const nextContentVelocity = getAdjustedContentVelocity(
        contentVelocity,
        size,
        DECELERATION_RATE_STRONG
      );
      const decelerationRate = pagingEnabled
        ? DECELERATION_RATE_STRONG
        : DECELERATION_RATE_WEAK;

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
  };

  _onDragCancel = () => {
    this.setState((state, props) => {
      const { contentOffset, contentVelocity, size, contentSize, drag } = state;
      const { pagingEnabled } = props;

      const decelerationEndOffset = getAdjustedContentOffset(
        drag.startOffset,
        size,
        contentSize,
        pagingEnabled
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

    props.onStart = this._onDragStart;
    props.onMove = this._onDragMove;
    props.onEnd = this._onDragEnd;
    props.onCancel = this._onDragCancel;
    props.style = {
      overflow: 'hidden',
      position: 'relative',
      width: size.width,
      height: size.height,
      ...props.style,
    };

    return (
      <Pannable {...props} ref={this.elemRef}>
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
