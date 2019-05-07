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

  componentDidMount() {
    const elemNode = this.elemRef.current;

    elemNode.addEventListener('touchstart', this._onTouchStart, false);
    elemNode.addEventListener('touchmove', this._onTouchMove, false);
    elemNode.addEventListener('mousedown', this._onMouseDown, false);
    elemNode.addEventListener('click', this._onClick, false);
  }

  componentDidUpdate(prevProps) {
    const { enabled } = this.props;

    if (enabled !== prevProps.enabled) {
      if (!enabled) {
        this._cancel();
      }
    }
  }

  componentWillUnmount() {
    const elemNode = this.elemRef.current;

    elemNode.removeEventListener('touchstart', this._onTouchStart, false);
    elemNode.removeEventListener('touchmove', this._onTouchMove, false);
    elemNode.removeEventListener('mousedown', this._onMouseDown, false);
    elemNode.removeEventListener('click', this._onClick, false);
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
          this._shouldPreventClick = true;

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
    target.addEventListener('touchmove', this._onTargetTouchMove, false);
    target.addEventListener('touchend', this._onTargetTouchEnd, false);
    target.addEventListener('touchcancel', this._onTargetTouchCancel, false);
  }
  _removeTouchPanListener(target) {
    target.removeEventListener('touchmove', this._onTargetTouchMove, false);
    target.removeEventListener('touchend', this._onTargetTouchEnd, false);
    target.removeEventListener('touchcancel', this._onTargetTouchCancel, false);
  }
  _onTouchStart = evt => {
    this._touchSupported = true;

    if (evt.touches && evt.touches.length === 1) {
      this._track(evt.touches[0]);
      this._addTouchPanListener(evt.target);
    }
  };
  _onTouchMove = evt => {
    evt.preventDefault();
  };
  _onTargetTouchMove = evt => {
    evt.preventDefault();

    if (evt.touches && evt.touches.length === 1) {
      this._move(evt.touches[0]);
    }
  };
  _onTargetTouchEnd = evt => {
    this._removeTouchPanListener(evt.target);
    this._end();
  };
  _onTargetTouchCancel = evt => {
    this._removeTouchPanListener(evt.target);
    this._end();
  };

  _addMousePanListener() {
    const doc = document.documentElement;

    doc.addEventListener('mousemove', this._onDocMouseMove, false);
    doc.addEventListener('mouseup', this._onDocMouseUp, false);
  }
  _removeMousePanListener() {
    const doc = document.documentElement;

    doc.removeEventListener('mousemove', this._onDocMouseMove, false);
    doc.removeEventListener('mouseup', this._onDocMouseUp, false);
  }
  _onMouseDown = evt => {
    if (this._touchSupported) {
      return;
    }

    this._removeMousePanListener();
    this._addMousePanListener();
    this._track(evt);
  };
  _onDocMouseMove = evt => {
    evt.preventDefault();
    this._move(evt);
  };
  _onDocMouseUp = () => {
    this._removeMousePanListener();
    this._end();
  };

  _onClick = evt => {
    if (this._shouldPreventClick) {
      this._shouldPreventClick = false;
      evt.preventDefault();
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
    }

    return <div {...props} ref={this.elemRef} />;
  }
}
