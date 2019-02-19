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
  const rate = 0.005;
  const acc = rate * (velocity > 0 ? 1 : -1);
  const passed = Math.round(-offset / size);
  const dist = -offset - passed * size;
  let time = 0;
  let nVelocity = 0;
  let nOffset = offset + dist;

  if ((velocity > 0 && dist < 0) || (velocity < 0 && dist > 0)) {
  } else {
    if (dist <= 0.5 * velocity * (velocity / acc)) {
      time = (velocity - Math.sqrt(velocity * velocity - 2 * acc * dist)) / acc;

      if (interval < time) {
        nVelocity = velocity - acc * interval;
        nOffset =
          offset - 0.5 * acc * Math.pow(interval, 2) + velocity * interval;
      }
    } else {
      time =
        (2 * Math.sqrt(2 * acc * dist + velocity * velocity) - velocity) / acc;
      const timeH =
        (2 * Math.sqrt(acc * dist + 0.5 * velocity * velocity) - velocity) /
        acc;
      const velocityH = Math.sqrt(acc * dist + 0.5 * velocity * velocity);

      if (interval <= timeH) {
        nVelocity = velocity + acc * interval;
        nOffset =
          offset + 0.5 * acc * Math.pow(interval, 2) + velocity * interval;
      } else if (interval < time) {
        nVelocity = 2 * velocityH - velocity - acc * interval;
        nOffset =
          offset -
          1.5 * acc * Math.pow(interval, 2) +
          (3 * velocityH - 2 * velocity) * interval -
          Math.pow(velocityH - velocity, 2) / acc;
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
    let decelerating = false;

    if (velocity.x !== 0 || velocity.y !== 0) {
      decelerating = true;
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
