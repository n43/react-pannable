import React from 'react';
import Pannable from './Pannable';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';

function calculateDecelerationLinear(interval, velocity, offset, size, cSize) {
  const rate = 0.002;
  const acc = rate * (velocity > 0 ? 1 : -1);
  const time = velocity / acc;
  let nVelocity, nOffset;

  if (interval < time) {
    nVelocity = velocity - acc * interval;
    nOffset = offset - 0.5 * acc * Math.pow(interval, 2) + velocity * interval;
  } else {
    nVelocity = 0;
    nOffset = offset + 0.5 * velocity * (velocity / acc);
  }

  const anOffset = Math.max(Math.min(size - cSize), Math.min(nOffset, 0));

  if (anOffset !== nOffset) {
    nOffset = anOffset;
    nVelocity = 0;
  }

  return { velocity: nVelocity, offset: nOffset };
}

function calculateDecelerationPaging(interval, velocity, offset, size, cSize) {
  const rate = 0.01;
  const pageNum = Math.round(-offset / size);
  const dist = -offset - pageNum * size;
  let nVelocity = 0;
  let nOffset = offset + dist;

  if (dist !== 0) {
    const acc = rate * (dist > 0 ? 1 : -1);

    if (
      ((velocity > 0 && dist > 0) || (velocity < 0 && dist < 0)) &&
      dist * acc <= 0.5 * velocity * velocity
    ) {
      const velocityE =
        Math.sqrt(velocity * velocity - 2 * acc * dist) * (dist > 0 ? 1 : -1);
      const time = (velocity - velocityE) / acc;

      if (interval < time) {
        nVelocity = velocity - acc * interval;
        nOffset = offset + 0.5 * (2 * velocity - acc * interval) * interval;
      }
    } else {
      const velocityH =
        Math.sqrt(0.5 * velocity * velocity + acc * dist) * (dist > 0 ? 1 : -1);
      const timeH = (velocityH - velocity) / acc;
      const time = (2 * velocityH - velocity) / acc;

      if (interval < time) {
        nVelocity = velocityH - acc * Math.abs(timeH - interval);
        nOffset =
          offset +
          0.5 * (velocity + velocityH) * timeH -
          0.5 *
            (2 * velocityH - acc * Math.abs(timeH - interval)) *
            (timeH - interval);
      }
    }
  }

  return { velocity: nVelocity, offset: nOffset };
}

function getAdjustedContentOffset(offset, size, contentSize) {
  return {
    x: Math.max(
      Math.min(size.width - contentSize.width, 0),
      Math.min(offset.x, 0)
    ),
    y: Math.max(
      Math.min(size.height - contentSize.height, 0),
      Math.min(offset.y, 0)
    ),
  };
}

export default class Pad extends React.Component {
  static defaultProps = {
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    contentStyle: null,
    pagingEnabled: false,
  };

  state = {
    size: { width: 0, height: 0 },
    contentSize: { width: 0, height: 0 },
    contentOffset: { x: 0, y: 0 },
    dragging: false,
    decelerating: false,
    draggingStartPosition: null,
    deceleratingVelocity: null,
  };

  static getDerivedStateFromProps(props, state) {
    const { width, height, contentWidth, contentHeight } = props;
    const { size, contentSize, contentOffset } = state;
    const nextState = {};
    let needsUpdateContentOffset = false;

    if (
      (width !== 0 && width !== size.width) ||
      (height !== 0 && height !== size.height)
    ) {
      needsUpdateContentOffset = true;

      nextState.size = {
        width,
        height,
      };
    }
    if (
      (contentWidth !== 0 && contentWidth !== contentSize.width) ||
      (contentHeight !== 0 && contentHeight !== contentSize.height)
    ) {
      needsUpdateContentOffset = true;

      nextState.contentSize = {
        width: contentWidth,
        height: contentHeight,
      };
    }

    if (needsUpdateContentOffset) {
      nextState.contentOffset = getAdjustedContentOffset(
        contentOffset,
        nextState.size || size,
        nextState.contentSize || contentSize
      );
    }

    return nextState;
  }

  componentDidUpdate(prevProps, prevState) {
    const { onResize, onContentResize, onScroll } = this.props;
    const {
      size,
      contentSize,
      contentOffset,
      dragging,
      decelerating,
      deceleratingVelocity,
    } = this.state;

    if (prevState.size !== size) {
      if (onResize) {
        onResize({ size, contentSize, contentOffset, dragging, decelerating });
      }
    }
    if (prevState.contentSize !== contentSize) {
      if (onContentResize) {
        onContentResize({
          size,
          contentSize,
          contentOffset,
          dragging,
          decelerating,
        });
      }
    }
    if (prevState.contentOffset !== contentOffset) {
      if (onScroll) {
        onScroll({ size, contentSize, contentOffset, dragging, decelerating });
      }
    }
    if (prevState.deceleratingVelocity !== deceleratingVelocity) {
      this._decelerate();
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

  _willDecelerate({ contentOffset, velocity }) {
    const { size } = this.state;

    if (this.props.pagingEnabled) {
      if (
        contentOffset.x % size.width !== 0 ||
        contentOffset.y % size.height !== 0
      ) {
        return true;
      }
    } else {
      if (velocity.x !== 0 || velocity.y !== 0) {
        return true;
      }
    }

    return false;
  }

  _decelerate() {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
    }

    if (!this.state.decelerating) {
      return;
    }

    const startTime = new Date().getTime();

    this._deceleratingTimer = requestAnimationFrame(() => {
      const interval = new Date().getTime() - startTime;

      this._deceleratingTimer = undefined;
      this._decelerateWithInterval(interval);
    });
  }

  _decelerateWithInterval(interval) {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      pagingEnabled,
    } = this.props;
    const { deceleratingVelocity, contentOffset } = this.state;
    const calculateDeceleration = pagingEnabled
      ? calculateDecelerationPaging
      : calculateDecelerationLinear;
    const nextX = calculateDeceleration(
      interval,
      deceleratingVelocity.x,
      contentOffset.x,
      width,
      contentWidth
    );
    const nextY = calculateDeceleration(
      interval,
      deceleratingVelocity.y,
      contentOffset.y,
      height,
      contentHeight
    );
    const nextContentOffset = { x: nextX.offset, y: nextY.offset };
    const nextVelocity = { x: nextX.velocity, y: nextY.velocity };

    this.setState({
      contentOffset: nextContentOffset,
      deceleratingVelocity: nextVelocity,
      decelerating: this._willDecelerate({
        contentOffset: nextContentOffset,
        velocity: nextVelocity,
      }),
    });
  }

  _onDragStart = () => {
    this.setState(({ contentOffset }) => ({
      draggingStartPosition: contentOffset,
      dragging: true,
      deceleratingVelocity: null,
      decelerating: false,
    }));
  };

  _onDragMove = ({ translation }) => {
    this.setState(({ size, contentSize, draggingStartPosition }) => {
      const contentOffset = getAdjustedContentOffset(
        {
          x: draggingStartPosition.x + translation.x,
          y: draggingStartPosition.y + translation.y,
        },
        size,
        contentSize
      );

      return { contentOffset };
    });
  };

  _onDragEnd = ({ velocity, translation }) => {
    this.setState(({ size, contentSize, draggingStartPosition }) => {
      const contentOffset = getAdjustedContentOffset(
        {
          x: draggingStartPosition.x + translation.x,
          y: draggingStartPosition.y + translation.y,
        },
        size,
        contentSize
      );

      return {
        contentOffset,
        draggingStartPosition: null,
        dragging: false,
        deceleratingVelocity: velocity,
        decelerating: this._willDecelerate({ contentOffset, velocity }),
      };
    });
  };

  render() {
    const { style, contentStyle, children } = this.props;
    const { size, contentSize, contentOffset } = this.state;
    const wrapperStyles = StyleSheet.create({
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
      transform: `translate3d(${contentOffset.x}px, ${contentOffset.y}px, 0)`,
      ...contentStyle,
    });
    return (
      <Pannable
        style={wrapperStyles}
        onStart={this._onDragStart}
        onMove={this._onDragMove}
        onEnd={this._onDragEnd}
      >
        <div style={contentStyles}>{children}</div>
      </Pannable>
    );
  }
}
