import React from 'react';
import Pannable from './Pannable';

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

  _decelerateScroll(velocity, contentOffset) {
    const interval = 50.0;
    const decelerationRate = 0.002;
    let decelerating = false;

    if (velocity.x !== 0 || velocity.y !== 0) {
      decelerating = true;
    }

    this.setState({ contentOffset, decelerating, dragging: false });

    if (!decelerating) {
      return;
    }

    const calculateNext = (vx, ox, minOx) => {
      const redirect = vx < 0 ? -1 : 1;
      const time = Math.min((redirect * vx) / decelerationRate, interval);
      let nvx = vx - redirect * decelerationRate * time;
      const nox1 = ox + 0.5 * (vx + nvx) * time;
      const nox2 = Math.max(minOx, Math.min(nox1, 0));

      if (nox2 !== nox1) {
        nvx = 0;
      }

      return { velocity: nvx, offset: nox2 };
    };

    const { width, height, contentWidth, contentHeight } = this.props;
    const resultX = calculateNext(
      velocity.x,
      contentOffset.x,
      width - contentWidth
    );
    const resultY = calculateNext(
      velocity.y,
      contentOffset.y,
      height - contentHeight
    );

    const nextVelocity = { x: resultX.velocity, y: resultY.velocity };
    const nextContentOffset = { x: resultX.offset, y: resultY.offset };

    if (this._decelerateScrollTimer) {
      clearTimeout(this._decelerateScrollTimer);
    }

    this._decelerateScrollTimer = setTimeout(() => {
      this._decelerateScrollTimer = undefined;
      this._decelerateScroll(nextVelocity, nextContentOffset);
    }, interval);
  }

  _autoAdjustContentOffset(offset) {
    const { width, height, contentWidth, contentHeight } = this.props;

    return {
      x: Math.max(width - contentWidth, Math.min(offset.x, 0)),
      y: Math.max(height - contentHeight, Math.min(offset.y, 0)),
    };
  }

  _onDragStart = () => {
    if (this._decelerateScrollTimer) {
      clearTimeout(this._decelerateScrollTimer);
      this._decelerateScrollTimer = undefined;
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

    this._decelerateScroll(velocity, contentOffset);
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
    const transform = `translate3d(${contentOffset.x}px, ${
      contentOffset.y
    }px, 0)`;
    const wrapperStyles = {
      boxSizing: 'border-box',
      overflow: 'hidden',
      width,
      height,
      ...style,
    };
    const contentStyles = {
      transform,
      WebkitTransform: transform,
      width: contentWidth,
      height: contentHeight,
      ...contentStyle,
    };

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
