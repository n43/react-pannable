import React from 'react';
import Pannable from './Pannable';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import {
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  getAdjustedContentVelocity,
  calculateDeceleration,
  calculateRectOffset,
} from './utils/motion';

const DECELERATION_RATE_STRONG = 0.04;
const DECELERATION_RATE_WEAK = 0.004;

export default class Pad extends React.PureComponent {
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
  };

  constructor(props) {
    super(props);

    const { width, height, contentWidth, contentHeight } = props;

    this.state = {
      size: { width, height },
      contentSize: { width: contentWidth, height: contentHeight },
      contentOffset: { x: 0, y: 0 },
      contentVelocity: { x: 0, y: 0 },
      prevContentOffset: null,
      dragging: false,
      decelerating: false,
      dragStartOffset: null,
      dragDirection: 'xy',
      decelerationEndOffset: null,
      decelerationRate: DECELERATION_RATE_STRONG,
    };

    this.boundingRef = React.createRef();
    this.contentRef = React.createRef();
    this.setContentSize = this.setContentSize.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {
      size,
      contentSize,
      contentOffset,
      contentVelocity,
      prevContentOffset,
      dragging,
      decelerating,
      decelerationEndOffset,
      decelerationRate,
    } = state;
    const nextState = {};

    if (prevContentOffset !== contentOffset) {
      let nextContentVelocity = contentVelocity;
      let nextDecelerating = decelerating;
      let nextDecelerationEndOffset = decelerationEndOffset;
      let nextDecelerationRate = decelerationRate;

      const adjustedContentOffset = getAdjustedContentOffset(
        contentOffset,
        size,
        contentSize,
        false
      );

      if (
        contentOffset.x !== adjustedContentOffset.x ||
        contentOffset.y !== adjustedContentOffset.y
      ) {
        if (
          nextDecelerationEndOffset &&
          !(
            nextDecelerationEndOffset.x === adjustedContentOffset.x &&
            nextDecelerationEndOffset.y === adjustedContentOffset.y
          )
        ) {
          nextDecelerationEndOffset = {
            x:
              contentOffset.x !== adjustedContentOffset.x
                ? adjustedContentOffset.x
                : nextDecelerationEndOffset.x,
            y:
              contentOffset.y !== adjustedContentOffset.y
                ? adjustedContentOffset.y
                : nextDecelerationEndOffset.y,
          };
          nextDecelerationRate = DECELERATION_RATE_STRONG;

          const adjustedContentVelocity = getAdjustedContentVelocity(
            nextContentVelocity,
            contentOffset,
            nextDecelerationEndOffset,
            size,
            nextDecelerationRate
          );
          if (
            nextContentVelocity.x !== adjustedContentVelocity.x ||
            nextContentVelocity.y !== adjustedContentVelocity.y
          ) {
            nextContentVelocity = adjustedContentVelocity;
          }
        }
      }

      if (
        nextDecelerationEndOffset &&
        nextDecelerationEndOffset.x === contentOffset.x &&
        nextDecelerationEndOffset.y === contentOffset.y &&
        nextContentVelocity.x === 0 &&
        nextContentVelocity.y === 0
      ) {
        nextDecelerating = false;
        nextDecelerationEndOffset = null;
      }

      nextState.prevContentOffset = contentOffset;

      if (nextContentVelocity !== contentVelocity) {
        nextState.contentVelocity = nextContentVelocity;
      }
      if (nextDecelerating !== decelerating) {
        nextState.decelerating = nextDecelerating;
      }
      if (nextDecelerationEndOffset !== decelerationEndOffset) {
        nextState.decelerationEndOffset = nextDecelerationEndOffset;
      }
      if (nextDecelerationRate !== decelerationRate) {
        nextState.decelerationRate = nextDecelerationRate;
      }

      props.onScroll({
        contentOffset,
        contentVelocity: nextContentVelocity,
        decelerating: nextDecelerating,
        dragging,
        size,
        contentSize,
      });
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
    } = this.props;

    if (prevProps.width !== width || prevProps.height !== height) {
      this._setStateAndUpdateContentOffset({ size: { width, height } });
    }
    if (
      prevProps.contentWidth !== contentWidth ||
      prevProps.contentHeight !== contentHeight
    ) {
      this._setStateAndUpdateContentOffset({
        contentSize: { width: contentWidth, height: contentHeight },
      });
    }
    if (prevProps.pagingEnabled !== pagingEnabled) {
      if (pagingEnabled) {
        this._setStateAndUpdateContentOffset();
      }
    }
    if (prevState.contentOffset !== this.state.contentOffset) {
      if (this.state.decelerating) {
        const startTime = new Date().getTime();

        if (this._deceleratingTimer) {
          cancelAnimationFrame(this._deceleratingTimer);
        }

        this._deceleratingTimer = requestAnimationFrame(() => {
          this._deceleratingTimer = undefined;
          this._decelerate(new Date().getTime() - startTime);
        });
      }
    }
  }

  componentWillUnmount() {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
      this._deceleratingTimer = undefined;
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
    return this.state.dragging;
  }

  isDecelerating() {
    return this.state.decelerating;
  }

  setContentSize(contentSize) {
    this._setStateAndUpdateContentOffset({ contentSize });
  }

  scrollTo({ offset, animated }) {
    this.setState(
      ({ contentOffset, size, contentSize, dragging }, { pagingEnabled }) => {
        if (dragging) {
          return null;
        }

        offset = getAdjustedContentOffset(
          offset,
          size,
          contentSize,
          pagingEnabled
        );

        if (!animated) {
          return {
            contentOffset: offset,
            contentVelocity: { x: 0, y: 0 },
            decelerating: false,
            decelerationEndOffset: null,
          };
        }

        return {
          contentOffset: { ...contentOffset },
          decelerating: true,
          decelerationEndOffset: offset,
          decelerationRate: DECELERATION_RATE_STRONG,
        };
      }
    );
  }

  scrollToRect({ rect, align = 'auto', animated }) {
    const { contentOffset, size } = this.state;
    const offset = calculateRectOffset(rect, align, contentOffset, size);

    this.scrollTo({ offset, animated });
  }

  _setStateAndUpdateContentOffset(state = {}) {
    this.setState(({ dragging, contentOffset }) => {
      if (dragging) {
        return state;
      }

      return {
        ...state,
        contentOffset: { ...contentOffset },
        decelerating: true,
        decelerationEndOffset: contentOffset,
        decelerationRate: DECELERATION_RATE_STRONG,
      };
    });
  }

  _decelerate(interval) {
    this.setState(
      ({
        contentVelocity,
        contentOffset,
        decelerating,
        decelerationEndOffset,
        decelerationRate,
      }) => {
        if (!decelerating) {
          return null;
        }

        const next = calculateDeceleration(
          interval,
          decelerationRate,
          contentOffset,
          contentVelocity,
          decelerationEndOffset
        );

        return { contentOffset: next.offset, contentVelocity: next.velocity };
      }
    );
  }

  _onDragStart = ({ velocity }) => {
    this.setState(({ contentOffset }, { directionalLockEnabled }) => {
      const dragDirection = !directionalLockEnabled
        ? 'xy'
        : Math.abs(velocity.x) > Math.abs(velocity.y)
        ? 'x'
        : 'y';
      const contentVelocity = {
        x: dragDirection === 'y' ? 0 : velocity.x,
        y: dragDirection === 'x' ? 0 : velocity.y,
      };

      return {
        contentOffset: { ...contentOffset },
        contentVelocity,
        dragging: true,
        dragStartOffset: contentOffset,
        dragDirection,
        decelerating: false,
        decelerationEndOffset: null,
      };
    });
  };

  _onDragMove = ({ translation, interval }) => {
    this.setState(
      (
        { contentOffset, size, contentSize, dragStartOffset, dragDirection },
        { alwaysBounceX, alwaysBounceY }
      ) => {
        const nextContentOffset = getAdjustedBounceOffset(
          {
            x: dragStartOffset.x + (dragDirection === 'y' ? 0 : translation.x),
            y: dragStartOffset.y + (dragDirection === 'x' ? 0 : translation.y),
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
      }
    );
  };

  _onDragEnd = () => {
    this.setState(
      (
        { contentOffset, contentVelocity, size, contentSize },
        { pagingEnabled }
      ) => {
        const decelerationRate = pagingEnabled
          ? DECELERATION_RATE_STRONG
          : DECELERATION_RATE_WEAK;
        let decelerationEndOffset = getDecelerationEndOffset(
          contentOffset,
          contentVelocity,
          decelerationRate
        );

        if (pagingEnabled) {
          decelerationEndOffset = getAdjustedContentOffset(
            decelerationEndOffset,
            size,
            contentSize,
            true
          );
        }

        return {
          contentOffset: { ...contentOffset },
          dragging: false,
          dragStartOffset: null,
          dragDirection: 'xy',
          decelerating: true,
          decelerationEndOffset,
          decelerationRate,
        };
      }
    );
  };

  _onDragCancel = () => {
    this.setState(({ contentOffset, dragStartOffset }) => {
      let decelerationEndOffset = dragStartOffset;

      return {
        contentOffset: { ...contentOffset },
        dragging: false,
        dragStartOffset: null,
        dragDirection: 'xy',
        decelerating: true,
        decelerationEndOffset,
        decelerationRate: DECELERATION_RATE_STRONG,
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
      style,
      children,
      ...boundingProps
    } = this.props;
    const { size, contentSize, contentOffset } = this.state;
    const boundingStyles = StyleSheet.create({
      overflow: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      width: size.width,
      height: size.height,
      ...style,
    });
    const contentStyles = StyleSheet.create({
      position: 'relative',
      boxSizing: 'border-box',
      width: contentSize.width,
      height: contentSize.height,
      transformTranslate: [contentOffset.x, contentOffset.y],
    });

    return (
      <Pannable
        {...boundingProps}
        ref={this.boundingRef}
        style={boundingStyles}
        enabled={scrollEnabled}
        onStart={this._onDragStart}
        onMove={this._onDragMove}
        onEnd={this._onDragEnd}
        onCancel={this._onDragCancel}
      >
        <div ref={this.contentRef} style={contentStyles}>
          {typeof children === 'function' ? children(this) : children}
        </div>
      </Pannable>
    );
  }
}
