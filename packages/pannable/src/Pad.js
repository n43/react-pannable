import React from 'react';
import Pannable from './Pannable';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import {
  getAdjustedContentOffset,
  getAdjustedPagingOffset,
  getAdjustedPagingVelocity,
  getDecelerationEndOffset,
  calculateDeceleration,
} from './utils/motion';

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
      decelerationRate: 0,
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
    } = state;
    const nextState = {};

    if (prevContentOffset !== contentOffset) {
      let nextContentOffset = getAdjustedContentOffset(
        contentOffset,
        size,
        contentSize
      );
      let nextContentVelocity = contentVelocity;
      let nextDecelerating = decelerating;
      let nextDecelerationEndOffset = decelerationEndOffset;

      if (
        nextContentOffset.x === contentOffset.x &&
        nextContentOffset.y === contentOffset.y
      ) {
        nextContentOffset = contentOffset;
      } else {
        nextContentVelocity = {
          x:
            nextContentOffset.x !== contentOffset.x ? 0 : nextContentVelocity.x,
          y:
            nextContentOffset.y !== contentOffset.y ? 0 : nextContentVelocity.y,
        };
        if (nextDecelerationEndOffset) {
          nextDecelerationEndOffset = {
            x:
              nextContentOffset.x !== contentOffset.x
                ? nextContentOffset.x
                : nextDecelerationEndOffset.x,
            y:
              nextContentOffset.y !== contentOffset.y
                ? nextContentOffset.y
                : nextDecelerationEndOffset.y,
          };
        }
      }

      if (nextDecelerationEndOffset) {
        if (
          nextContentOffset.x === nextDecelerationEndOffset.x &&
          nextContentOffset.y === nextDecelerationEndOffset.y &&
          nextContentVelocity.x === 0 &&
          nextContentVelocity.y === 0
        ) {
          nextDecelerating = false;
          nextDecelerationEndOffset = null;

          nextState.decelerationRate = 0;
        }
      }

      nextState.prevContentOffset = contentOffset;
      nextState.contentOffset = nextContentOffset;

      if (nextContentVelocity !== contentVelocity) {
        nextState.contentVelocity = nextContentVelocity;
      }
      if (nextDecelerating !== decelerating) {
        nextState.decelerating = nextDecelerating;
      }
      if (nextDecelerationEndOffset !== decelerationEndOffset) {
        nextState.decelerationEndOffset = nextDecelerationEndOffset;
      }

      props.onScroll({
        contentOffset: nextContentOffset,
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
    const { width, height, contentWidth, contentHeight } = this.props;

    if (prevProps.width !== width || prevProps.height !== height) {
      this.setState(({ contentOffset }) => ({
        size: { width, height },
        contentOffset: { ...contentOffset },
      }));
    }
    if (
      prevProps.contentWidth !== contentWidth ||
      prevProps.contentHeight !== contentHeight
    ) {
      this.setState(({ contentOffset }) => ({
        contentSize: {
          width: contentWidth,
          height: contentHeight,
        },
        contentOffset: { ...contentOffset },
      }));
    }
    if (prevState.contentOffset !== this.state.contentOffset) {
      if (this.state.decelerationEndOffset) {
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
    this.setState(({ contentOffset }) => ({
      contentSize,
      contentOffset: { ...contentOffset },
    }));
  }

  scrollTo({ offset, animated }) {
    this.setState(({ contentOffset, size, dragging }, { pagingEnabled }) => {
      if (dragging) {
        return null;
      }

      if (!animated) {
        return {
          contentOffset: offset,
          contentVelocity: { x: 0, y: 0 },
          decelerating: false,
          decelerationEndOffset: null,
          decelerationRate: 0,
        };
      }

      if (pagingEnabled) {
        offset = getAdjustedPagingOffset(offset, size);
      }

      return {
        contentOffset: { ...contentOffset },
        decelerating: true,
        decelerationEndOffset: offset,
        decelerationRate: 0.01,
      };
    });
  }

  _decelerate(interval) {
    this.setState(
      ({
        contentVelocity,
        contentOffset,
        decelerationEndOffset,
        decelerationRate,
      }) => {
        if (!decelerationEndOffset) {
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

  _onDragStart = ({ translation, velocity }) => {
    this.setState(({ contentOffset }, { directionalLockEnabled }) => {
      const dragDirection = !directionalLockEnabled
        ? 'xy'
        : Math.abs(velocity.x) > Math.abs(velocity.y)
        ? 'x'
        : 'y';
      const dragStartOffset = {
        x: contentOffset.x + (dragDirection === 'y' ? 0 : translation.x),
        y: contentOffset.y + (dragDirection === 'x' ? 0 : translation.y),
      };
      const contentVelocity = {
        x: dragDirection === 'y' ? 0 : velocity.x,
        y: dragDirection === 'x' ? 0 : velocity.y,
      };

      return {
        contentOffset: dragStartOffset,
        contentVelocity,
        dragging: true,
        dragStartOffset,
        dragDirection,
        decelerating: false,
        decelerationEndOffset: null,
        decelerationRate: 0,
      };
    });
  };

  _onDragMove = ({ translation, velocity }) => {
    this.setState(({ dragStartOffset, dragDirection }) => {
      const contentOffset = {
        x: dragStartOffset.x + (dragDirection === 'y' ? 0 : translation.x),
        y: dragStartOffset.y + (dragDirection === 'x' ? 0 : translation.y),
      };
      const contentVelocity = {
        x: dragDirection === 'y' ? 0 : velocity.x,
        y: dragDirection === 'x' ? 0 : velocity.y,
      };

      return { contentOffset, contentVelocity };
    });
  };

  _onDragEnd = ({ translation, velocity }) => {
    this.setState(
      ({ dragStartOffset, dragDirection, size }, { pagingEnabled }) => {
        const contentOffset = {
          x: dragStartOffset.x + (dragDirection === 'y' ? 0 : translation.x),
          y: dragStartOffset.y + (dragDirection === 'x' ? 0 : translation.y),
        };
        let contentVelocity = {
          x: dragDirection === 'y' ? 0 : velocity.x,
          y: dragDirection === 'x' ? 0 : velocity.y,
        };
        const decelerationRate = pagingEnabled ? 0.02 : 0.002;

        if (pagingEnabled) {
          contentVelocity = getAdjustedPagingVelocity(
            contentVelocity,
            size,
            decelerationRate
          );
        }

        let decelerationEndOffset = getDecelerationEndOffset(
          contentOffset,
          contentVelocity,
          decelerationRate
        );

        if (pagingEnabled) {
          decelerationEndOffset = getAdjustedPagingOffset(
            decelerationEndOffset,
            size
          );
        }

        return {
          contentOffset,
          contentVelocity,
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

  _onDragCancel = ({ translation, velocity }) => {
    this.setState(({ dragStartOffset, size }, { pagingEnabled }) => {
      const contentOffset = {
        x: dragStartOffset.x + translation.x,
        y: dragStartOffset.y + translation.y,
      };

      let decelerationEndOffset = dragStartOffset;

      if (pagingEnabled) {
        decelerationEndOffset = getAdjustedPagingOffset(
          decelerationEndOffset,
          size
        );
      }

      return {
        contentOffset,
        contentVelocity: velocity,
        dragging: false,
        dragStartOffset: null,
        dragDirection: 'xy',
        decelerating: true,
        decelerationEndOffset,
        decelerationRate: 0.01,
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
          {React.isValidElement(children) ? children : children(this)}
        </div>
      </Pannable>
    );
  }
}
