import React from 'react';
import StyleSheet from './utils/StyleSheet';

const MIN_DISTANCE = 0;

export default class Pannable extends React.Component {
  static defaultProps = {
    enabled: true,
    onStart: () => {},
    onMove: () => {},
    onEnd: () => {},
    onCancel: () => {},
  };

  state = {
    trackingStartXY: null,
    target: null,
    translation: null,
    velocity: null,
    startXY: null,
    moveXY: null,
    moveT: null,
  };

  elemRef = React.createRef();

  componentDidUpdate(prevProps) {
    const { enabled } = this.props;

    if (prevProps.enabled !== enabled && !enabled) {
      this.setState((state, props) => {
        if (state.target) {
          return Pannable._cancel(null, state, props);
        }

        return null;
      });
    }
  }

  componentWillUnmount() {
    document.documentElement.removeEventListener(
      'mousemove',
      this._onMouseMove,
      false
    );
    document.documentElement.removeEventListener(
      'mouseup',
      this._onMouseUp,
      false
    );
  }

  static _shouldStart(evt, state, props) {
    const { trackingStartXY } = state;

    if (
      trackingStartXY &&
      (Math.abs(evt.pageX - trackingStartXY.x) > MIN_DISTANCE ||
        Math.abs(evt.pageY - trackingStartXY.y) > MIN_DISTANCE)
    ) {
      return true;
    }

    return false;
  }
  static _start(evt, state, props) {
    const nextState = {
      trackingStartXY: null,
      translation: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      target: evt.target,
      startXY: { x: evt.pageX, y: evt.pageY },
      moveXY: { x: evt.pageX, y: evt.pageY },
      moveT: new Date().getTime(),
    };

    props.onStart({
      translation: nextState.translation,
      velocity: nextState.velocity,
      target: nextState.target,
    });

    return nextState;
  }
  static _move(evt, state, props) {
    const { startXY, moveXY, moveT } = state;
    const now = new Date().getTime();
    const interval = now - moveT;

    const nextState = {
      target: evt.target,
      translation: {
        x: evt.pageX - startXY.x,
        y: evt.pageY - startXY.y,
      },
      velocity: {
        x: (evt.pageX - moveXY.x) / interval,
        y: (evt.pageY - moveXY.y) / interval,
      },
      moveXY: { x: evt.pageX, y: evt.pageY },
      moveT: now,
    };

    props.onMove({
      translation: nextState.translation,
      velocity: nextState.velocity,
      target: nextState.target,
    });

    return nextState;
  }
  static _end(evt, state, props) {
    const { target, translation, velocity } = state;

    const nextState = {
      target: null,
      translation: null,
      velocity: null,
      startXY: null,
      moveXY: null,
      moveT: null,
    };

    props.onEnd({ target, translation, velocity });

    return nextState;
  }

  static _cancel(evt, state, props) {
    const { target, translation, velocity } = state;

    const nextState = {
      target: null,
      translation: null,
      velocity: null,
      startXY: null,
      moveXY: null,
      moveT: null,
    };

    props.onCancel({ target, translation, velocity });

    return nextState;
  }

  _onTouchStart = evt => {
    const { enabled, onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      const touchEvt = evt.touches[0];

      if (enabled) {
        this.setState({
          trackingStartXY: { x: touchEvt.pageX, y: touchEvt.pageY },
        });
      }
    }

    if (onTouchStart) {
      onTouchStart(evt);
    }
  };
  _onTouchMove = evt => {
    const { onTouchMove } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      const touchEvt = evt.touches[0];
      const params = {
        target: touchEvt.target,
        pageX: touchEvt.pageX,
        pageY: touchEvt.pageY,
      };

      this.setState((state, props) => {
        if (Pannable._shouldStart(params, state, props)) {
          return Pannable._start(params, state, props);
        }
        if (state.target) {
          return Pannable._move(params, state, props);
        }

        return null;
      });
    }

    if (onTouchMove) {
      onTouchMove(evt);
    }
  };
  _onTouchEnd = evt => {
    const { onTouchEnd } = this.props;

    if (evt.changedTouches && evt.changedTouches.length === 1) {
      const touchEvt = evt.changedTouches[0];
      const params = {
        target: touchEvt.target,
        pageX: touchEvt.pageX,
        pageY: touchEvt.pageY,
      };

      this.setState((state, props) => {
        if (state.target) {
          return Pannable._end(params, state, props);
        }
        if (state.trackingStartXY) {
          return { trackingStartXY: null };
        }

        return null;
      });
    }

    if (onTouchEnd) {
      onTouchEnd(evt);
    }
  };
  _onTouchCancel = evt => {
    const { onTouchCancel } = this.props;

    if (evt.changedTouches && evt.changedTouches.length === 1) {
      const touchEvt = evt.changedTouches[0];
      const params = {
        target: touchEvt.target,
        pageX: touchEvt.pageX,
        pageY: touchEvt.pageY,
      };

      this.setState((state, props) => {
        if (state.target) {
          return Pannable._end(params, state, props);
        }
        if (state.trackingStartXY) {
          return { trackingStartXY: null };
        }

        return null;
      });
    }

    if (onTouchCancel) {
      onTouchCancel(evt);
    }
  };
  _onMouseDown = evt => {
    const { enabled, onMouseDown } = this.props;

    this._shouldPreventClick = enabled;

    if (enabled) {
      this.setState({ trackingStartXY: { x: evt.pageX, y: evt.pageY } });

      document.documentElement.addEventListener(
        'mousemove',
        this._onMouseMove,
        false
      );
      document.documentElement.addEventListener(
        'mouseup',
        this._onMouseUp,
        false
      );
    }

    if (onMouseDown) {
      onMouseDown(evt);
    }
  };
  _onMouseMove = evt => {
    const params = { target: evt.target, pageX: evt.pageX, pageY: evt.pageY };

    if (this._shouldPreventClick) {
      evt.preventDefault();
    }

    this.setState((state, props) => {
      if (Pannable._shouldStart(params, state, props)) {
        return Pannable._start(params, state, props);
      }
      if (state.target) {
        return Pannable._move(params, state, props);
      }

      return null;
    });
  };
  _onMouseUp = evt => {
    const params = { target: evt.target, pageX: evt.pageX, pageY: evt.pageY };

    if (this._shouldPreventClick) {
      evt.preventDefault();
    }

    this.setState((state, props) => {
      if (state.target) {
        return Pannable._end(params, state, props);
      }

      if (state.trackingStartXY) {
        this._shouldPreventClick = false;

        return { trackingStartXY: null };
      }

      return null;
    });

    document.documentElement.removeEventListener(
      'mousemove',
      this._onMouseMove,
      false
    );
    document.documentElement.removeEventListener(
      'mouseup',
      this._onMouseUp,
      false
    );
  };

  _onClick = evt => {
    const { onClick } = this.props;

    if (this._shouldPreventClick) {
      evt.preventDefault();
    }

    this._shouldPreventClick = false;

    if (onClick) {
      onClick(evt);
    }
  };

  render() {
    const {
      enabled,
      onStart,
      onMove,
      onEnd,
      onCancel,
      style,
      ...elemProps
    } = this.props;
    const styles = StyleSheet.create({
      touchAction: enabled ? 'none' : 'auto',
      ...style,
    });

    return (
      <div
        {...elemProps}
        ref={this.elemRef}
        style={styles}
        onTouchStart={this._onTouchStart}
        onTouchEnd={this._onTouchEnd}
        onTouchMove={this._onTouchMove}
        onTouchCancel={this._onTouchCancel}
        onMouseDown={this._onMouseDown}
        onClick={this._onClick}
      />
    );
  }
}
