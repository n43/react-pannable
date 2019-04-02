import React from 'react';
import StyleSheet from './utils/StyleSheet';

const MIN_DISTANCE = 0;

export default class Pannable extends React.Component {
  static defaultProps = {
    enabled: true,
    shouldStart: () => true,
    onStart: () => {},
    onMove: () => {},
    onEnd: () => {},
    onCancel: () => {},
  };

  state = {
    target: null,
    translation: null,
    interval: null,
    velocity: null,
    startPoint: null,
    movePoint: null,
    moveTime: null,
  };

  elemRef = React.createRef();

  componentDidUpdate(prevProps) {
    const { enabled } = this.props;

    if (prevProps.enabled !== enabled && !enabled) {
      this._cancel();
    }
  }

  componentWillUnmount() {
    this._removeMousePanListener();
  }

  _track(evt) {
    this.setState({
      startPoint: { x: evt.pageX, y: evt.pageY },
      movePoint: { x: evt.pageX, y: evt.pageY },
      moveTime: new Date().getTime(),
    });
  }
  _move(evt) {
    evt = { target: evt.target, pageX: evt.pageX, pageY: evt.pageY };

    this.setState((state, props) => {
      const { shouldStart, onStart, onMove } = props;
      const { target, startPoint, movePoint, moveTime } = state;

      if (!startPoint) {
        return null;
      }

      const nextMoveTime = new Date().getTime();
      const nextMovePoint = { x: evt.pageX, y: evt.pageY };
      const interval = nextMoveTime - moveTime;
      let translation = {
        x: nextMovePoint.x - startPoint.x,
        y: nextMovePoint.y - startPoint.y,
      };
      const velocity = {
        x: (nextMovePoint.x - movePoint.x) / interval,
        y: (nextMovePoint.y - movePoint.y) / interval,
      };
      const nextState = {
        translation,
        velocity,
        interval,
        movePoint: nextMovePoint,
        moveTime: nextMoveTime,
      };

      if (!target) {
        const dist = Math.sqrt(
          translation.x * translation.x + translation.y * translation.y
        );

        if (
          MIN_DISTANCE < dist &&
          shouldStart({ target: evt.target, translation, velocity, interval })
        ) {
          nextState.target = evt.target;
          nextState.startPoint = { x: evt.pageX, y: evt.pageY };
          nextState.translation = translation = { x: 0, y: 0 };

          onStart({ target: evt.target, translation, velocity, interval });
        }
      } else {
        onMove({ target, translation, velocity, interval });
      }

      return nextState;
    });
  }
  _end() {
    this.setState((state, props) => {
      const { target, translation, velocity, interval } = state;

      if (target) {
        props.onEnd({ target, translation, velocity, interval });
      }

      return {
        target: null,
        translation: null,
        velocity: null,
        interval: null,
        startPoint: null,
        movePoint: null,
        moveTime: null,
      };
    });
  }
  _cancel() {
    this.setState((state, props) => {
      const { target, translation, velocity, interval } = state;

      if (target) {
        props.onCancel({ target, translation, velocity, interval });
      }

      return {
        target: null,
        translation: null,
        velocity: null,
        interval: null,
        startPoint: null,
        movePoint: null,
        moveTime: null,
      };
    });
  }

  _onTouchStart = evt => {
    const { enabled, onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      if (enabled) {
        this._track(evt.touches[0]);
      }
    }

    if (onTouchStart) {
      onTouchStart(evt);
    }
  };
  _onTouchMove = evt => {
    const { onTouchMove } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      this._move(evt.touches[0]);
    }

    if (onTouchMove) {
      onTouchMove(evt);
    }
  };
  _onTouchEnd = evt => {
    const { onTouchEnd } = this.props;

    if (evt.changedTouches && evt.changedTouches.length === 1) {
      this._end();
    }

    if (onTouchEnd) {
      onTouchEnd(evt);
    }
  };
  _onTouchCancel = evt => {
    const { onTouchCancel } = this.props;

    if (evt.changedTouches && evt.changedTouches.length === 1) {
      this._end();
    }

    if (onTouchCancel) {
      onTouchCancel(evt);
    }
  };

  _addMousePanListener() {
    const doc = document.documentElement;

    doc.addEventListener('mousemove', this._onMouseMove, false);
    doc.addEventListener('mouseup', this._onMouseUp, false);
  }
  _removeMousePanListener() {
    const doc = document.documentElement;

    doc.removeEventListener('mousemove', this._onMouseMove, false);
    doc.removeEventListener('mouseup', this._onMouseUp, false);
  }
  _onMouseDown = evt => {
    const { enabled, onMouseDown } = this.props;

    this._shouldPreventClick = enabled;

    if (enabled) {
      this._removeMousePanListener();
      this._addMousePanListener();
      this._track(evt);
    }

    if (onMouseDown) {
      onMouseDown(evt);
    }
  };
  _onMouseMove = evt => {
    evt.preventDefault();
    this._move(evt);
  };
  _onMouseUp = evt => {
    evt.preventDefault();
    this._removeMousePanListener();
    this._end();
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
      shouldStart,
      onStart,
      onMove,
      onEnd,
      onCancel,
      ...props
    } = this.props;

    props.onTouchStart = this._onTouchStart;
    props.onTouchEnd = this._onTouchEnd;
    props.onTouchMove = this._onTouchMove;
    props.onTouchCancel = this._onTouchCancel;
    props.onMouseDown = this._onMouseDown;
    props.onClick = this._onClick;
    props.style = StyleSheet.create({
      touchAction: enabled ? 'none' : 'auto',
      ...props.style,
    });

    return <div {...props} ref={this.elemRef} />;
  }
}
