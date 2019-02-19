import React from 'react';
import Pannable from './Pannable';

export default class Pad extends React.Component {
  state = {
    contentOffset: { x: 0, y: 0 },
  };

  _onDragStart = () => {
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

  _onDragEnd = () => {
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
      MsTransform: transform,
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
