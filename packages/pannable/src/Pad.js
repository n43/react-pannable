import React from 'react';
import Pannable from './Pannable';
import styleSheet from './utils/styleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';

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

  _decelerate(velocity, contentOffset) {
    const decelerationRate = 0.002;
    let decelerating = false;
    let interval = 1000 / 60;

    if (this.lastAnimationTime) {
      const now = new Date().getTime();
      interval = now - this.lastAnimationTime;
      this.lastAnimationTime = now;
    }
    console.log(interval);
    if (velocity.x !== 0 || velocity.y !== 0) {
      decelerating = true;
    }

    this.setState({ contentOffset, decelerating, dragging: false });

    if (!decelerating) {
      this.lastAnimationTime = undefined;
      return;
    }

    function calculateDecelerate(vx, ox, minOx) {
      const redirect = vx < 0 ? -1 : 1;
      const time = (redirect * vx) / decelerationRate;
      let nvx, nox;

      if (time > interval) {
        nvx = vx - redirect * decelerationRate * interval;
        nox =
          ox + (vx - 0.5 * redirect * decelerationRate * interval) * interval;
      } else {
        nvx = 0;
        nox = ox + 0.5 * vx * (vx / decelerationRate);
      }

      const nox2 = Math.max(minOx, Math.min(nox, 0));

      if (nox2 !== nox) {
        nox = nox2;
        nvx = 0;
      }

      return { velocity: nvx, offset: nox };
    }

    const { width, height, contentWidth, contentHeight } = this.props;
    const resultX = calculateDecelerate(
      velocity.x,
      contentOffset.x,
      width - contentWidth
    );
    const resultY = calculateDecelerate(
      velocity.y,
      contentOffset.y,
      height - contentHeight
    );

    const nextVelocity = { x: resultX.velocity, y: resultY.velocity };
    const nextContentOffset = { x: resultX.offset, y: resultY.offset };

    if (this._decelerateTimer) {
      cancelAnimationFrame(this._decelerateTimer);
    }

    this._decelerateTimer = requestAnimationFrame(() => {
      this._decelerateTimer = undefined;
      this._decelerate(nextVelocity, nextContentOffset);
    });
  }

  _autoAdjustContentOffset(offset) {
    const { width, height, contentWidth, contentHeight } = this.props;

    return {
      x: Math.max(width - contentWidth, Math.min(offset.x, 0)),
      y: Math.max(height - contentHeight, Math.min(offset.y, 0)),
    };
  }

  _onDragStart = () => {
    if (this._decelerateTimer) {
      clearTimeout(this._decelerateTimer);
      this._decelerateTimer = undefined;
    }
    this._startContentOffset = this.state.contentOffset;
  };

  _onDragMove = ({ translation }) => {
    const contentOffset = this._autoAdjustContentOffset({
      x: this._startContentOffset.x + translation.x,
      y: this._startContentOffset.y + translation.y,
    });

    this.setState({ contentOffset, dragging: true, decelerating: false });
  };

  _onDragEnd = ({ velocity, translation }) => {
    const contentOffset = this._autoAdjustContentOffset({
      x: this._startContentOffset.x + translation.x,
      y: this._startContentOffset.y + translation.y,
    });

    this._decelerate(velocity, contentOffset);
    this._startContentOffset = undefined;
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
    const wrapperStyles = styleSheet.create({
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      width,
      height,
      transform: wrapperTransform,
      ...style,
    });
    const contentStyles = styleSheet.create({
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
