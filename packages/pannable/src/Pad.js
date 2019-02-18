import React from 'react';
import Pannable from './Pannable';

export default class Pad extends React.Component {
  state = {
    contentOffset: { x: 0, y: 0 },
  };

  _decelerateScroll(velocity) {
    const { width, height, contentWidth, contentHeight } = this.props;
    const interval = 50;

    this._decelerateScrollTimer = setTimeout(() => {
      const prevState = this.state;
      const contentOffset = {
        x: Math.max(
          width - contentWidth,
          Math.min(prevState.contentOffset.x + velocity.x * interval, 0)
        ),
        y: Math.max(
          height - contentHeight,
          Math.min(prevState.contentOffset.y + velocity.y * interval, 0)
        ),
      };

      if (
        prevState.contentOffset.x !== contentOffset.x ||
        prevState.contentOffset.y !== contentOffset.y
      ) {
        this.setState({ contentOffset }, () => {
          this._decelerateScroll(velocity);
        });
      }
    }, interval);
  }

  _onDragStart = () => {
    if (this._decelerateScrollTimer) {
      clearTimeout(this._decelerateScrollTimer);
      this._decelerateScrollTimer = undefined;
    }
    this._startContentOffset = this.state.contentOffset;
  };

  _onDragMove = ({ translation }) => {
    const { width, height, contentWidth, contentHeight } = this.props;

    this.setState({
      contentOffset: {
        x: Math.max(
          width - contentWidth,
          Math.min(this._startContentOffset.x + translation.x, 0)
        ),
        y: Math.max(
          height - contentHeight,
          Math.min(this._startContentOffset.y + translation.y, 0)
        ),
      },
    });
  };

  _onDragEnd = ({ velocity }) => {
    this._startContentOffset = undefined;
    this._decelerateScroll(velocity);
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
