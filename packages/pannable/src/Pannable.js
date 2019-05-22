import React from 'react';
import StyleSheet from './utils/StyleSheet';

const MIN_DISTANCE = 0;

/* eslint no-restricted-globals:"off" */

let root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else {
  root = {};
}

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

  static getDerivedStateFromProps(props, state) {
    if (!props.enabled && state.target) {
      return {
        target: null,
        startPoint: null,
        movePoint: null,
        moveTime: null,
        translation: null,
        velocity: null,
        interval: null,
      };
    }

    return null;
  }

  componentDidMount() {
    if (this.props.enabled) {
      this._addElemListener();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { enabled, onStart, onMove, onEnd, onCancel } = this.props;
    const { target, translation } = this.state;

    if (enabled !== prevProps.enabled) {
      if (enabled) {
        this._addElemListener();
      } else {
        this._removeElemListener();
      }
    }

    if (target !== prevState.target) {
      if (target) {
        this._clickPrevented = true;
        onStart(this._getPannableEvent());
      } else {
        if (enabled) {
          onEnd(this._getPannableEvent());
        } else {
          onCancel(this._getPannableEvent());
        }
      }
    } else if (translation !== prevState.translation) {
      onMove(this._getPannableEvent());
    }
  }

  componentWillUnmount() {
    if (this.props.enabled) {
      this._removeElemListener();
    }
    this._removeMousePanListener();
  }

  _addElemListener() {
    const elemNode = this.elemRef.current;

    if (!elemNode.addEventListener) {
      return;
    }

    elemNode.addEventListener('touchstart', this._onTouchStart, false);
    elemNode.addEventListener('touchmove', this._onTouchMove, false);
    elemNode.addEventListener('mousedown', this._onMouseDown, false);
    elemNode.addEventListener('click', this._onClick, false);
  }

  _removeElemListener() {
    const elemNode = this.elemRef.current;

    if (!elemNode.removeEventListener) {
      return;
    }

    elemNode.removeEventListener('touchstart', this._onTouchStart, false);
    elemNode.removeEventListener('touchmove', this._onTouchMove, false);
    elemNode.removeEventListener('mousedown', this._onMouseDown, false);
    elemNode.removeEventListener('click', this._onClick, false);
  }

  _getPannableEvent() {
    const { target, translation, velocity, interval } = this.state;

    return { target, translation, velocity, interval };
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
      const { shouldStart } = props;
      const { target, startPoint, movePoint, moveTime } = state;

      const nextMovePoint = { x: evt.pageX, y: evt.pageY };
      const nextMoveTime = new Date().getTime();
      const interval = nextMoveTime - moveTime;
      const translation = {
        x: nextMovePoint.x - startPoint.x,
        y: nextMovePoint.y - startPoint.y,
      };
      const velocity = {
        x: (nextMovePoint.x - movePoint.x) / interval,
        y: (nextMovePoint.y - movePoint.y) / interval,
      };

      if (target) {
        return {
          movePoint: nextMovePoint,
          moveTime: nextMoveTime,
          translation,
          velocity,
          interval,
        };
      }

      const dist = Math.sqrt(
        translation.x * translation.x + translation.y * translation.y
      );

      if (dist <= MIN_DISTANCE) {
        return {
          movePoint: nextMovePoint,
          moveTime: nextMoveTime,
        };
      }

      if (
        !shouldStart({ target: evt.target, translation, velocity, interval })
      ) {
        return {
          startPoint: null,
          movePoint: null,
          moveTime: null,
        };
      }

      return {
        target: evt.target,
        startPoint: { x: evt.pageX, y: evt.pageY },
        movePoint: nextMovePoint,
        moveTime: nextMoveTime,
        translation: { x: 0, y: 0 },
        velocity,
        interval,
      };
    });
  }

  _end() {
    this.setState({
      target: null,
      startPoint: null,
      movePoint: null,
      moveTime: null,
      translation: null,
      velocity: null,
      interval: null,
    });
  }

  _addTouchPanListener(target) {
    if (!target.addEventListener) {
      return;
    }

    target.addEventListener('touchmove', this._onTargetTouchMove, false);
    target.addEventListener('touchend', this._onTargetTouchEnd, false);
    target.addEventListener('touchcancel', this._onTargetTouchCancel, false);
  }

  _removeTouchPanListener(target) {
    if (!target.removeEventListener) {
      return;
    }

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
    if (this.state.target) {
      evt.preventDefault();
    }
  };

  _onTargetTouchMove = evt => {
    if (!this.state.startPoint) {
      this._removeTouchPanListener(evt.target);
      return;
    }

    if (this.state.target) {
      evt.preventDefault();
    }

    this._move(evt.touches[0]);
  };

  _onTargetTouchEnd = evt => {
    this._removeTouchPanListener(evt.target);

    if (this.state.target) {
      evt.preventDefault();

      this._end();
    }
  };

  _onTargetTouchCancel = evt => {
    this._removeTouchPanListener(evt.target);

    if (this.state.target) {
      evt.preventDefault();

      this._end();
    }
  };

  _addMousePanListener() {
    if (!root.addEventListener) {
      return;
    }

    root.addEventListener('mousemove', this._onRootMouseMove, false);
    root.addEventListener('mouseup', this._onRootMouseUp, false);
  }

  _removeMousePanListener() {
    if (!root.removeEventListener) {
      return;
    }

    root.removeEventListener('mousemove', this._onRootMouseMove, false);
    root.removeEventListener('mouseup', this._onRootMouseUp, false);
  }

  _onMouseDown = evt => {
    if (this._touchSupported) {
      return;
    }

    this._track(evt);
    this._removeMousePanListener();
    this._addMousePanListener();
  };

  _onRootMouseMove = evt => {
    if (!this.state.startPoint) {
      this._removeMousePanListener();
      return;
    }

    evt.preventDefault();

    this._move(evt);
  };

  _onRootMouseUp = evt => {
    this._removeMousePanListener();

    evt.preventDefault();

    if (this.state.target) {
      this._end();
    }
  };

  _onClick = evt => {
    if (this._clickPrevented) {
      this._clickPrevented = undefined;
      evt.preventDefault();
      evt.stopImmediatePropagation();
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
    const { target } = this.state;
    const elemStyle = {};

    if (enabled) {
      elemStyle.touchAction = 'none';
    }
    if (target) {
      elemStyle.userSelect = 'none';
    }

    props.style = {
      ...StyleSheet.create(elemStyle),
      ...props.style,
    };

    return <div {...props} ref={this.elemRef} />;
  }
}
