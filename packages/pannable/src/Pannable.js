import React from 'react';
import StyleSheet from './utils/StyleSheet';

const MIN_DISTANCE = 0;

export default class Pannable extends React.Component {
  static defaultProps = {
    enabled: true,
  };

  state = {
    trackingStartXY: null,
    dragging: false,
    translation: null,
    velocity: null,
    startXY: null,
    moveXY: null,
    moveT: null,
  };

  elemRef = React.createRef;

  componentDidUpdate(prevProps) {
    const { enabled } = this.props;

    if (prevProps.enabled !== enabled && !enabled) {
      this.setState((state, props) => {
        if (state.dragging) {
          return Pannable._cancel(null, state, props);
        }

        return null;
      });
    }
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
    const { onStart } = props;

    const nextState = {
      trackingStartXY: null,
      dragging: true,
      translation: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      startXY: { x: evt.pageX, y: evt.pageY },
      moveXY: { x: evt.pageX, y: evt.pageY },
      moveT: new Date().getTime(),
    };

    if (onStart) {
      onStart({
        translation: nextState.translation,
        velocity: nextState.velocity,
        target: evt.target,
      });
    }

    return nextState;
  }

  static _move(evt, state, props) {
    const { onMove } = props;
    const { startXY, moveXY, moveT } = state;
    const now = new Date().getTime();
    const interval = now - moveT;

    const nextState = {
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

    if (onMove) {
      onMove({
        translation: nextState.translation,
        velocity: nextState.velocity,
        target: evt.target,
      });
    }

    return nextState;
  }

  static _end(evt, state, props) {
    const { onEnd } = props;
    const { translation, velocity } = state;

    const nextState = {
      dragging: false,
      translation: null,
      velocity: null,
      startXY: null,
      moveXY: null,
      moveT: null,
    };

    if (onEnd) {
      onEnd({ translation, velocity, target: evt.target });
    }

    return nextState;
  }

  static _cancel(evt, state, props) {
    const { onCancel } = props;
    const { translation, velocity } = state;

    const nextState = {
      dragging: false,
      translation: null,
      velocity: null,
      startXY: null,
      moveXY: null,
      moveT: null,
    };

    if (onCancel) {
      onCancel({ translation, velocity });
    }

    return nextState;
  }

  _onTouchStart = evt => {
    const { onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      const touchEvt = evt.touches[0];
      const { pageX, pageY } = touchEvt;

      this.setState((state, props) => {
        if (props.enabled) {
          return { trackingStartXY: { x: pageX, y: pageY } };
        }

        return null;
      });
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
        pageX: touchEvt.pageX,
        pageY: touchEvt.pageY,
        target: touchEvt.target,
      };

      this.setState((state, props) => {
        if (Pannable._shouldStart(params, state, props)) {
          return Pannable._start(params, state, props);
        } else if (state.dragging) {
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
        pageX: touchEvt.pageX,
        pageY: touchEvt.pageY,
        target: touchEvt.target,
      };

      this.setState((state, props) => {
        if (state.trackingStartXY) {
          return { trackingStartXY: null };
        } else if (state.dragging) {
          return Pannable._end(params, state, props);
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
        pageX: touchEvt.pageX,
        pageY: touchEvt.pageY,
        target: touchEvt.target,
      };

      this.setState((state, props) => {
        if (state.trackingStartXY) {
          return { trackingStartXY: null };
        } else if (state.dragging) {
          return Pannable._end(params, state, props);
        }

        return null;
      });
    }

    if (onTouchCancel) {
      onTouchCancel(evt);
    }
  };
  _onMouseDown = evt => {
    const { onMouseDown } = this.props;
    const { pageX, pageY } = evt;

    this.setState((state, props) => {
      if (props.enabled) {
        return { trackingStartXY: { x: pageX, y: pageY } };
      }

      return null;
    });

    this._shouldPreventClick = false;

    if (onMouseDown) {
      onMouseDown(evt);
    }
  };
  _onMouseMove = evt => {
    evt.preventDefault();

    const { onMouseMove } = this.props;
    const params = { pageX: evt.pageX, pageY: evt.pageY, target: evt.target };

    this.setState((state, props) => {
      if (Pannable._shouldStart(params, state, props)) {
        return Pannable._start(params, state, props);
      } else if (state.dragging) {
        return Pannable._move(params, state, props);
      }

      return null;
    });

    if (onMouseMove) {
      onMouseMove(evt);
    }
  };
  _onMouseUp = evt => {
    const { onMouseUp } = this.props;
    const params = { pageX: evt.pageX, pageY: evt.pageY, target: evt.target };

    this.setState((state, props) => {
      if (state.trackingStartXY) {
        return { trackingStartXY: null };
      } else if (state.dragging) {
        this._shouldPreventClick = true;

        return Pannable._end(params, state, props);
      }

      return null;
    });

    if (onMouseUp) {
      onMouseUp(evt);
    }
  };
  _onMouseLeave = evt => {
    const { onMouseLeave } = this.props;
    const params = { pageX: evt.pageX, pageY: evt.pageY, target: evt.target };

    this.setState((state, props) => {
      if (state.trackingStartXY) {
        return { trackingStartXY: null };
      } else if (state.dragging) {
        return Pannable._end(params, state, props);
      }

      return null;
    });

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
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
        onClick={this._onClick}
      />
    );
  }
}
