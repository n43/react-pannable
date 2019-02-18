import React from 'react';

const MIN_DISTANCE = 2;

export default class Pannable extends React.Component {
  state = {
    tracking: false,
  };

  _onTouchStart = evt => {
    const { onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      const touchEvt = evt.touches[0];
      this._startXY = [touchEvt.pageX, touchEvt.pageY];
    }

    if (onTouchStart) {
      onTouchStart(evt);
    }
  };
  _onTouchMove = evt => {
    const { onTouchMove } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      const touchEvt = evt.touches[0];

      if (this._shouldStart(touchEvt)) {
        this._startXY = undefined;
        this._start(touchEvt);
      } else if (this.state.tracking) {
        this._move(touchEvt);
      }
    }

    if (onTouchMove) {
      onTouchMove(evt);
    }
  };
  _onTouchEnd = evt => {
    const { onTouchEnd } = this.props;

    if (evt.changedTouches && evt.changedTouches.length === 1) {
      const touchEvt = evt.touches[0];

      this._startXY = undefined;

      if (this.state.tracking) {
        this._end(touchEvt);
      }
    }

    if (onTouchEnd) {
      onTouchEnd(evt);
    }
  };
  _onTouchCancel = evt => {
    const { onTouchCancel } = this.props;

    if (evt.changedTouches && evt.changedTouches.length === 1) {
      const touchEvt = evt.touches[0];

      this._startXY = undefined;

      if (this.state.tracking) {
        this._cancel(touchEvt);
      }
    }

    if (onTouchCancel) {
      onTouchCancel(evt);
    }
  };
  _onMouseDown = evt => {
    const { onMouseDown } = this.props;

    this._startXY = [evt.pageX, evt.pageY];
    this._shouldPreventClick = false;

    if (onMouseDown) {
      onMouseDown(evt);
    }
  };
  _onMouseMove = evt => {
    const { onMouseMove } = this.props;

    if (this._shouldStart(evt)) {
      evt.preventDefault();

      this._startXY = undefined;
      this._start(evt);
    } else if (this.state.tracking) {
      evt.preventDefault();

      this._move(evt);
    }

    if (onMouseMove) {
      onMouseMove(evt);
    }
  };
  _onMouseUp = evt => {
    const { onMouseUp } = this.props;

    this._startXY = undefined;

    if (this.state.tracking) {
      this._shouldPreventClick = true;
      this._end(evt);
    }

    if (onMouseUp) {
      onMouseUp(evt);
    }
  };
  _onMouseLeave = evt => {
    const { onMouseLeave } = this.props;

    this._startXY = undefined;

    if (this.state.tracking) {
      this._cancel(evt);
    }

    if (onMouseLeave) {
      onMouseLeave(evt);
    }
  };
  _onClick = evt => {
    const { onClick } = this.props;

    if (this._shouldPreventClick) {
      evt.preventDefault();
    }

    if (onClick) {
      onClick(evt);
    }
  };

  _shouldStart(evt) {
    if (!this._startXY) {
      return false;
    }

    if (
      Math.abs(evt.pageX - this._startXY[0]) < MIN_DISTANCE &&
      Math.abs(evt.pageY - this._startXY[1]) < MIN_DISTANCE
    ) {
      return false;
    }

    return true;
  }

  _start(evt) {
    const { onStart } = this.props;

    this.setState({ tracking: true });

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

    this.setState({ tracking: false });

    if (onEnd) {
      onEnd(evt);
    }

    console.log('onEnd');
  }

  _cancel(evt) {
    const { onCancel } = this.props;

    this.setState({ tracking: false });

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
        onClick={this._onClick}
      >
        {children}
      </div>
    );
  }
}
