import React from 'react';

export default class Pannable extends React.Component {
  state = {
    panning: false,
  };

  _onTouchStart = evt => {
    const { onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      this._start(evt.touches[0]);
    }

    if (onTouchStart) {
      onTouchStart(evt);
    }
  };
  _onTouchMove = evt => {
    const { onTouchMove } = this.props;

    if (evt.touches && evt.touches.length === 1 && this.state.panning) {
      this._move(evt.touches[0]);
    }

    if (onTouchMove) {
      onTouchMove(evt);
    }
  };
  _onTouchEnd = evt => {
    const { onTouchEnd } = this.props;

    if (
      evt.changedTouches &&
      evt.changedTouches.length === 1 &&
      this.state.panning
    ) {
      this._end(evt.changedTouches[0]);
    }

    if (onTouchEnd) {
      onTouchEnd(evt);
    }
  };
  _onTouchCancel = evt => {
    const { onTouchCancel } = this.props;

    if (
      evt.changedTouches &&
      evt.changedTouches.length === 1 &&
      this.state.panning
    ) {
      this._cancel(evt.changedTouches[0]);
    }

    if (onTouchCancel) {
      onTouchCancel(evt);
    }
  };
  _onMouseDown = evt => {
    const { onMouseDown } = this.props;

    this._start(evt);

    if (onMouseDown) {
      onMouseDown(evt);
    }
  };
  _onMouseMove = evt => {
    const { onMouseMove } = this.props;

    if (this.state.panning) {
      this._move(evt);
    }

    if (onMouseMove) {
      onMouseMove(evt);
    }
  };
  _onMouseUp = evt => {
    const { onMouseLeave } = this.props;

    if (this.state.panning) {
      this._end(evt);
    }

    if (onMouseLeave) {
      onMouseLeave(evt);
    }
  };
  _onMouseLeave = evt => {
    const { onMouseLeave } = this.props;

    if (this.state.panning) {
      this._cancel(evt);
    }

    if (onMouseLeave) {
      onMouseLeave(evt);
    }
  };

  _start(evt) {
    const { onStart } = this.props;

    this.setState({ panning: true });

    if (onStart) {
      onStart(evt);
    }

    console.log('onStart');
  }

  _move(evt) {
    const { onMove } = this.props;

    if (onMove) {
      onMove(evt);
    }

    console.log('onMove');
  }

  _end(evt) {
    const { onEnd } = this.props;

    this.setState({ panning: false });

    if (onEnd) {
      onEnd(evt);
    }

    console.log('onEnd');
  }

  _cancel(evt) {
    const { onCancel } = this.props;

    this.setState({ panning: false });

    if (onCancel) {
      onCancel(evt);
    }

    console.log('onCancel');
  }

  render() {
    const { style, children } = this.props;
    const wrapperStyle = { touchAction: 'none', ...style };

    return (
      <div
        style={wrapperStyle}
        onTouchStart={this._onTouchStart}
        onTouchEnd={this._onTouchEnd}
        onTouchMove={this._onTouchMove}
        onTouchCancel={this._onTouchCancel}
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
      >
        {children}
      </div>
    );
  }
}
