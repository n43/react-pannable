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
  getDecelerationEndPosition,
  calculateDeceleration,
} from './utils/motion';

export default class Pad extends React.Component {
  static defaultProps = {
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    contentProps: {},
    scrollEnabled: true,
    pagingEnabled: false,
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
      dragStartPosition: null,
      decelerationEndPosition: null,
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
      decelerationEndPosition,
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
      let nextDecelerationEndPosition = decelerationEndPosition;

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
        if (nextDecelerationEndPosition) {
          nextDecelerationEndPosition = {
            x:
              nextContentOffset.x !== contentOffset.x
                ? nextContentOffset.x
                : nextDecelerationEndPosition.x,
            y:
              nextContentOffset.y !== contentOffset.y
                ? nextContentOffset.y
                : nextDecelerationEndPosition.y,
          };
        }
      }

      if (nextDecelerationEndPosition) {
        if (
          nextContentOffset.x === nextDecelerationEndPosition.x &&
          nextContentOffset.y === nextDecelerationEndPosition.y &&
          nextContentVelocity.x === 0 &&
          nextContentVelocity.y === 0
        ) {
          nextDecelerating = false;
          nextDecelerationEndPosition = null;

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
      if (nextDecelerationEndPosition !== decelerationEndPosition) {
        nextState.decelerationEndPosition = nextDecelerationEndPosition;
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
      if (this.state.decelerationEndPosition) {
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
          decelerationEndPosition: null,
          decelerationRate: 0,
        };
      }

      if (pagingEnabled) {
        offset = getAdjustedPagingOffset(offset, size);
      }

      return {
        contentOffset: { ...contentOffset },
        decelerating: true,
        decelerationEndPosition: offset,
        decelerationRate: 0.01,
      };
    });
  }

  _decelerate(interval) {
    this.setState(
      ({
        contentVelocity,
        contentOffset,
        decelerationEndPosition,
        decelerationRate,
      }) => {
        if (!decelerationEndPosition) {
          return null;
        }

        const next = calculateDeceleration(
          interval,
          decelerationRate,
          contentOffset,
          contentVelocity,
          decelerationEndPosition
        );

        return { contentOffset: next.offset, contentVelocity: next.velocity };
      }
    );
  }

  _onDragStart = ({ translation, velocity }) => {
    this.setState(({ contentOffset }) => {
      const dragStartPosition = {
        x: contentOffset.x + translation.x,
        y: contentOffset.y + translation.y,
      };

      return {
        contentOffset: dragStartPosition,
        contentVelocity: velocity,
        dragging: true,
        dragStartPosition,
        decelerating: false,
        decelerationEndPosition: null,
        decelerationRate: 0,
      };
    });
  };

  _onDragMove = ({ translation, velocity }) => {
    this.setState(({ dragStartPosition }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };

      return { contentOffset, contentVelocity: velocity };
    });
  };

  _onDragEnd = ({ translation, velocity }) => {
    this.setState(({ dragStartPosition, size }, { pagingEnabled }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };
      let contentVelocity = velocity;
      let decelerationRate = pagingEnabled ? 0.02 : 0.002;

      if (pagingEnabled) {
        contentVelocity = getAdjustedPagingVelocity(
          contentVelocity,
          size,
          decelerationRate
        );
      }

      let decelerationEndPosition = getDecelerationEndPosition(
        contentOffset,
        contentVelocity,
        decelerationRate
      );

      if (pagingEnabled) {
        decelerationEndPosition = getAdjustedPagingOffset(
          decelerationEndPosition,
          size
        );
      }

      return {
        contentOffset,
        contentVelocity,
        dragging: false,
        dragStartPosition: null,
        decelerating: true,
        decelerationEndPosition,
        decelerationRate,
      };
    });
  };

  _onDragCancel = ({ translation, velocity }) => {
    this.setState(({ dragStartPosition, size }, { pagingEnabled }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };

      let decelerationEndPosition = dragStartPosition;

      if (pagingEnabled) {
        decelerationEndPosition = getAdjustedPagingOffset(
          decelerationEndPosition,
          size
        );
      }

      return {
        contentOffset,
        contentVelocity: velocity,
        dragging: false,
        dragStartPosition: null,
        decelerating: true,
        decelerationEndPosition,
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
      contentProps,
      scrollEnabled,
      pagingEnabled,
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
      ...contentProps.style,
    });
    let Component = children;

    if (!React.isValidElement(Component)) {
      Component = <Component setContentSize={this.setContentSize} />;
    }

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
        <div {...contentProps} ref={this.contentRef} style={contentStyles}>
          {Component}
        </div>
      </Pannable>
    );
  }
}
