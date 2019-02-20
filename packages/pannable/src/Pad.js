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
    nOffset = offset + 0.5 * acc * velocity * (velocity / acc);
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
  const passed = Math.round(-offset / size);
  const dist = -offset - passed * size;
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

export default class Pad extends React.Component {
  state = {
    contentOffset: { x: 0, y: 0 },
    dragging: false,
    decelerating: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.contentOffset !== this.state.contentOffset) {
      const { onScroll } = this.props;
      const { contentOffset, dragging, decelerating } = this.state;

      if (onScroll) {
        onScroll({ contentOffset, dragging, decelerating });
      }
    }
  }

  componentWillUnmount() {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
      this._deceleratingTimer = undefined;
    }
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

  _decelerate({ velocity, contentOffset }) {
    const { pagingEnabled, width, height } = this.props;
    let decelerating = false;

    if (pagingEnabled) {
      if (contentOffset.x % width !== 0 || contentOffset.y % height !== 0) {
        decelerating = true;
      }
    } else {
      if (velocity.x !== 0 || velocity.y !== 0) {
        decelerating = true;
      }
    }

    this.setState({ contentOffset, decelerating, dragging: false });

    if (!decelerating) {
      return;
    }

    const startTime = new Date().getTime();

    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
    }

    this._deceleratingTimer = requestAnimationFrame(() => {
      const interval = new Date().getTime() - startTime;

      this._deceleratingTimer = undefined;
      this._decelerateWithInterval({ interval, velocity, contentOffset });
    });
  }

  _decelerateWithInterval({ interval, velocity, contentOffset }) {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      pagingEnabled,
    } = this.props;
    const calculateDeceleration = pagingEnabled
      ? calculateDecelerationPaging
      : calculateDecelerationLinear;
    const nextX = calculateDeceleration(
      interval,
      velocity.x,
      contentOffset.x,
      width,
      contentWidth
    );
    const nextY = calculateDeceleration(
      interval,
      velocity.y,
      contentOffset.y,
      height,
      contentHeight
    );

    this._decelerate({
      velocity: { x: nextX.velocity, y: nextY.velocity },
      contentOffset: { x: nextX.offset, y: nextY.offset },
    });
  }

  _getAdjustedContentOffset(offset) {
    const { width, height, contentWidth, contentHeight } = this.props;

    return {
      x: Math.max(Math.min(width - contentWidth, 0), Math.min(offset.x, 0)),
      y: Math.max(Math.min(height - contentHeight, 0), Math.min(offset.y, 0)),
    };
  }

  _onDragStart = () => {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
      this._deceleratingTimer = undefined;
    }
    this._startContentOffset = this.state.contentOffset;
  };

  _onDragMove = ({ translation }) => {
    const contentOffset = this._getAdjustedContentOffset({
      x: this._startContentOffset.x + translation.x,
      y: this._startContentOffset.y + translation.y,
    });

    this.setState({ contentOffset, dragging: true, decelerating: false });
  };

  _onDragEnd = ({ velocity, translation }) => {
    const contentOffset = this._getAdjustedContentOffset({
      x: this._startContentOffset.x + translation.x,
      y: this._startContentOffset.y + translation.y,
    });

    this._startContentOffset = undefined;
    this._decelerate({ velocity, contentOffset });
  };

  render() {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      style,
      contentStyle,
      children,
    } = this.props;
    const { contentOffset } = this.state;
    const contentTransform = `translate3d(${contentOffset.x}px, ${
      contentOffset.y
    }px, 0)`;
    const wrapperStyles = StyleSheet.create({
      overflow: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      width,
      height,
      ...style,
    });
    const contentStyles = StyleSheet.create({
      position: 'relative',
      boxSizing: 'border-box',
      width: contentWidth,
      height: contentHeight,
      transform: contentTransform,
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
