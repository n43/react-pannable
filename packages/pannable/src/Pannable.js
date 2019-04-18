import React from 'react';

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

    if (enabled !== prevProps.enabled) {
      if (!enabled) {
        this._cancel();
      }
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

  _addTouchPanListener(target) {
    target.addEventListener('touchmove', this._onTouchMove, false);
    target.addEventListener('touchend', this._onTouchEnd, false);
    target.addEventListener('touchcancel', this._onTouchCancel, false);
  }
  _removeTouchPanListener(target) {
    target.removeEventListener('touchmove', this._onTouchMove, false);
    target.removeEventListener('touchend', this._onTouchEnd, false);
    target.removeEventListener('touchcancel', this._onTouchCancel, false);
  }
  _onTouchStart = evt => {
    const { onTouchStart } = this.props;

    if (evt.touches && evt.touches.length === 1) {
      this._addTouchPanListener(evt.target);
      this._track(evt.touches[0]);
    }

    if (onTouchStart) {
      onTouchStart(evt);
    }
  };
  _onTouchMove = evt => {
    if (evt.touches && evt.touches.length === 1) {
      this._move(evt.touches[0]);
    }
  };
  _onTouchEnd = evt => {
    this._removeTouchPanListener(evt.target);
    this._end();
  };
  _onTouchCancel = evt => {
    this._removeTouchPanListener(evt.target);
    this._end();
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
    const { onMouseDown } = this.props;

    this._shouldPreventClick = true;

    this._removeMousePanListener();
    this._addMousePanListener();
    this._track(evt);

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

    if (enabled) {
      props.style = { touchAction: 'none', ...props.style };
      props.onTouchStart = this._onTouchStart;
      props.onMouseDown = this._onMouseDown;
      props.onClick = this._onClick;
    }

    return <div {...props} ref={this.elemRef} />;
  }
}
