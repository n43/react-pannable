import React from 'react';

const MIN_DISTANCE = 0;

export default class Pannable extends React.Component {
  state = {
    dragging: false,
  };

  _onTouchStart = evt => {
    const { onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      const touchEvt = evt.touches[0];
      this._prepareStartXY = { x: touchEvt.pageX, y: touchEvt.pageY };
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
        this._prepareStartXY = undefined;
        this._start(touchEvt);
      } else if (this.state.dragging) {
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
      const touchEvt = evt.changedTouches[0];

      if (this._prepareStartXY) {
        this._prepareStartXY = undefined;
      } else if (this.state.dragging) {
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
      const touchEvt = evt.changedTouches[0];

      if (this._prepareStartXY) {
        this._prepareStartXY = undefined;
      } else if (this.state.dragging) {
        this._end(touchEvt);
      }
    }

    if (onTouchCancel) {
      onTouchCancel(evt);
    }
  };
  _onMouseDown = evt => {
    const { onMouseDown } = this.props;

    this._prepareStartXY = { x: evt.pageX, y: evt.pageY };
    this._shouldPreventClick = false;

    if (onMouseDown) {
      onMouseDown(evt);
    }
  };
  _onMouseMove = evt => {
    const { onMouseMove } = this.props;

    if (this._shouldStart(evt)) {
      evt.preventDefault();

      this._prepareStartXY = undefined;
      this._start(evt);
    } else if (this.state.dragging) {
      evt.preventDefault();

      this._move(evt);
    }

    if (onMouseMove) {
      onMouseMove(evt);
    }
  };
  _onMouseUp = evt => {
    const { onMouseUp } = this.props;

    if (this._prepareStartXY) {
      this._prepareStartXY = undefined;
    } else if (this.state.dragging) {
      this._shouldPreventClick = true;
      this._end(evt);
    }

    if (onMouseUp) {
      onMouseUp(evt);
    }
  };
  _onMouseLeave = evt => {
    const { onMouseLeave } = this.props;

    if (this._prepareStartXY) {
      this._prepareStartXY = undefined;
    } else if (this.state.dragging) {
      this._end(evt);
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
    if (!this._prepareStartXY) {
      return false;
    }

    if (
      Math.abs(evt.pageX - this._prepareStartXY.x) <= MIN_DISTANCE &&
      Math.abs(evt.pageY - this._prepareStartXY.y) <= MIN_DISTANCE
    ) {
      return false;
    }

    return true;
  }

  _start(evt) {
    const { onStart } = this.props;

    this.setState({ dragging: true });

    if (onStart) {
      onStart({ originEvent: evt });
    }

    this._startXY = this._moveXY = { x: evt.pageX, y: evt.pageY };
    this._moveT = new Date().getTime();
  }

  _move(evt) {
    const { onMove } = this.props;
    const now = new Date().getTime();
    const params = {
      translation: {
        x: evt.pageX - this._startXY.x,
        y: evt.pageY - this._startXY.y,
      },
      velocity: {
        x: (evt.pageX - this._moveXY.x) / (now - this._moveT),
        y: (evt.pageY - this._moveXY.y) / (now - this._moveT),
      },
    };

    if (onMove) {
      onMove({ ...params, originEvent: evt });
    }

    this._moveParams = params;
    this._moveXY = { x: evt.pageX, y: evt.pageY };
    this._moveT = now;
  }

  _end(evt) {
    const { onEnd } = this.props;

    this.setState({ dragging: false });

    if (onEnd) {
      onEnd({ ...this._moveParams, originEvent: evt });
    }

    this._startXY = this._moveXY = this._moveT = this._moveParams = undefined;
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
