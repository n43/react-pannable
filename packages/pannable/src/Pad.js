import React from 'react';
import Pannable from './Pannable';
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

const DECELERATION_RATE_STRONG = 0.04;
const DECELERATION_RATE_WEAK = 0.004;

export default class Pad extends React.Component {
  static defaultProps = {
    children: null,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    scrollEnabled: true,
    pagingEnabled: false,
    directionalLockEnabled: false,
    alwaysBounceX: true,
    alwaysBounceY: true,
    onScroll: () => {},
    onResize: () => {},
    onContentResize: () => {},
  };

  constructor(props) {
    super(props);

    const {
      width,
      height,
      contentWidth,
      contentHeight,
      onResize,
      onContentResize,
    } = props;
    const size = { width, height };
    const contentSize = { width: contentWidth, height: contentHeight };

    this.state = {
      prevContentOffset: null,
      contentOffset: { x: 0, y: 0 },
      contentVelocity: { x: 0, y: 0 },
      size,
      contentSize,
      drag: null,
      deceleration: null,
    };

    this.boundingRef = React.createRef();
    this.contentRef = React.createRef();

    onResize(size);
    onContentResize(contentSize);
  }

  static getDerivedStateFromProps(props, state) {
    const {
      prevContentOffset,
      contentOffset,
      contentVelocity,
      size,
      contentSize,
      drag,
      deceleration,
    } = state;
    const { pagingEnabled } = props;
    const nextState = {};

    if (contentOffset !== prevContentOffset) {
      const validContentOffset =
        contentOffset ===
        getAdjustedContentOffset(contentOffset, size, contentSize, false);

      if (!validContentOffset) {
        let nextDeceleration = deceleration;
        let decelerationRate = DECELERATION_RATE_STRONG;
        let decelerationEndOffset;

        if (nextDeceleration) {
          const validEndOffset =
            nextDeceleration.endOffset ===
            getAdjustedContentOffset(
              nextDeceleration.endOffset,
              size,
              contentSize,
              false
            );

          if (!validEndOffset) {
            decelerationEndOffset = getDecelerationEndOffset(
              contentOffset,
              contentVelocity,
              size,
              pagingEnabled,
              decelerationRate
            );
            decelerationEndOffset = getAdjustedContentOffset(
              decelerationEndOffset,
              size,
              contentSize,
              pagingEnabled
            );
          }
        } else if (!drag) {
          decelerationEndOffset = getAdjustedContentOffset(
            contentOffset,
            size,
            contentSize,
            pagingEnabled
          );
        }

        if (decelerationEndOffset) {
          nextDeceleration = createDeceleration(
            contentOffset,
            contentVelocity,
            decelerationEndOffset,
            decelerationRate
          );
        }

        if (nextDeceleration !== deceleration) {
          nextState.deceleration = nextDeceleration;
        }
      }

      nextState.prevContentOffset = contentOffset;
    }

    return nextState;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      pagingEnabled,
      onScroll,
      onResize,
      onContentResize,
    } = this.props;
    const { contentOffset, size, contentSize, drag, deceleration } = this.state;

    if (prevProps.width !== width || prevProps.height !== height) {
      const size = { width, height };

      this._setStateWithScroll({ size });
    }

    if (
      prevProps.contentWidth !== contentWidth ||
      prevProps.contentHeight !== contentHeight
    ) {
      const contentSize = { width: contentWidth, height: contentHeight };

      this._setStateWithScroll({ contentSize });
    }

    if (prevProps.pagingEnabled !== pagingEnabled) {
      if (pagingEnabled) {
        this._setStateWithScroll(null);
      }
    }

    if (prevState.contentOffset !== contentOffset) {
      if (deceleration) {
        if (this._decelerationTimer) {
          cancelAnimationFrame(this._decelerationTimer);
        }

        this._decelerationTimer = requestAnimationFrame(() => {
          this._decelerationTimer = undefined;
          this._decelerate();
        });
      }

      onScroll({
        contentOffset,
        size,
        contentSize,
        dragging: !!drag,
        decelerating: !!deceleration,
      });
    }

    if (prevState.size !== size) {
      onResize(size);
    }

    if (prevState.contentSize !== contentSize) {
      onContentResize(contentSize);
    }
  }

  componentWillUnmount() {
    if (this._decelerationTimer) {
      cancelAnimationFrame(this._decelerationTimer);
      this._decelerationTimer = undefined;
    }
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

  isDragging() {
    return !!this.state.drag;
  }

  isDecelerating() {
    return !!this.state.deceleration;
  }

  getVisibleRect(state) {
    const { contentOffset, size } = state || this.state;

    return {
      x: -contentOffset.x,
      y: -contentOffset.y,
      width: size.width,
      height: size.height,
    };
  }

  setContentSize(contentSize) {
    this._setStateWithScroll({ contentSize });
  }

  scrollToRect({ rect, align = 'auto', animated }) {
    this._setContentOffset(
      state => calculateRectOffset(rect, this.getVisibleRect(state), align),
      animated
    );
  }

  scrollTo({ offset, animated }) {
    this._setContentOffset(offset, animated);
  }

  _setContentOffset(offset, animated) {
    this.setState((state, props) => {
      if (typeof offset === 'function') {
        offset = offset(state, props);
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
        nextState.contentOffset = offset;
        nextState.contentVelocity = { x: 0, y: 0 };

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
          nextState.deceleration = null;
        }
      } else {
        const decelerationRate = DECELERATION_RATE_STRONG;
        const decelerationEndOffset = getDecelerationEndOffset(
          offset,
          { x: 0, y: 0 },
          size,
          pagingEnabled,
          decelerationRate
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

  _setStateWithScroll(nextState) {
    this.setState((state, props) => {
      const {
        contentOffset,
        contentVelocity,
        size,
        drag,
        deceleration,
      } = state;
      const { pagingEnabled } = props;

      if (drag || deceleration) {
        return nextState;
      }

      const decelerationRate = DECELERATION_RATE_STRONG;
      const decelerationEndOffset = getDecelerationEndOffset(
        contentOffset,
        contentVelocity,
        size,
        pagingEnabled,
        decelerationRate
      );

      return {
        ...nextState,
        contentOffset: { ...contentOffset },
        deceleration: createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      };
    });
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
  };

  render() {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      scrollEnabled,
      pagingEnabled,
      directionalLockEnabled,
      alwaysBounceX,
      alwaysBounceY,
      onScroll,
      onResize,
      onContentResize,
      ...props
    } = this.props;
    const { size, contentSize, contentOffset } = this.state;

    const contentProps = {};
    let element = props.children;

    if (typeof element === 'function') {
      element = element(this);
    }

    if (React.isValidElement(element) && element.props.connectWithPad) {
      const onResize = element.props.onResize;
      const elemProps = {
        onResize: size => {
          this._setStateWithScroll({ contentSize: size });
          onResize(size);
        },
      };

      if (element.props.hasOwnProperty('visibleRect')) {
        elemProps.visibleRect = this.getVisibleRect();
      }

      element = React.cloneElement(element, elemProps);
    }

    contentProps.children = element;
    contentProps.style = StyleSheet.create({
      position: 'relative',
      boxSizing: 'border-box',
      width: contentSize.width,
      height: contentSize.height,
      transformTranslate: [contentOffset.x, contentOffset.y],
    });

    props.enabled = scrollEnabled;
    props.onStart = this._onDragStart;
    props.onMove = this._onDragMove;
    props.onEnd = this._onDragEnd;
    props.onCancel = this._onDragCancel;
    props.style = StyleSheet.create({
      overflow: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      width: size.width,
      height: size.height,
      ...props.style,
    });

    return (
      <Pannable {...props} ref={this.boundingRef}>
        <div {...contentProps} ref={this.contentRef} />
      </Pannable>
    );
  }
}
