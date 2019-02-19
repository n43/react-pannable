import React from 'react';
import Pannable from './Pannable';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';

function calculateDecelerationLinear(interval, vx, ox, w, cw) {
  const rate = 0.002;
  const redirect = vx < 0 ? -1 : 1;
  const time = (redirect * vx) / rate;
  let nvx, nox;

  if (time > interval) {
    nvx = vx - redirect * rate * interval;
    nox = ox + (vx - 0.5 * redirect * rate * interval) * interval;
  } else {
    nvx = 0;
    nox = ox + 0.5 * vx * (vx / rate);
  }

  const nox2 = Math.max(w - cw, Math.min(nox, 0));

  if (nox2 !== nox) {
    nox = nox2;
    nvx = 0;
  }

  return { velocity: nvx, offset: nox };
}

function calculateDecelerationPaging(vx, ox, w, cw) {}

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
    const resultX = calculateDeceleration(
      interval,
      velocity.x,
      contentOffset.x,
      width,
      contentWidth
    );
    const resultY = calculateDeceleration(
      interval,
      velocity.y,
      contentOffset.y,
      height,
      contentHeight
    );

    this._decelerate({
      velocity: { x: resultX.velocity, y: resultY.velocity },
      contentOffset: { x: resultX.offset, y: resultY.offset },
    });
  }

  _getAdjustedContentOffset(offset) {
    const { width, height, contentWidth, contentHeight } = this.props;

    return {
      x: Math.max(width - contentWidth, Math.min(offset.x, 0)),
      y: Math.max(height - contentHeight, Math.min(offset.y, 0)),
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
    const wrapperTransform = 'translate3d(0, 0, 0)';
    const contentTransform = `translate3d(${contentOffset.x}px, ${
      contentOffset.y
    }px, 0)`;
    const wrapperStyles = StyleSheet.create({
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      width,
      height,
      transform: wrapperTransform,
      ...style,
    });
    const contentStyles = StyleSheet.create({
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
