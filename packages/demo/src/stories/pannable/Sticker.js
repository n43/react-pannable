import React from 'react';
import { Pannable } from 'react-pannable';
import './Sticker.css';
import { calculateDeceleration } from 'react-pannable/src/utils/motion';

export default class Sticker extends React.Component {
  state = {
    hidden: false,
    enabled: true,
    width: 300,
    height: 300,
    translateX: 100,
    translateY: 100,
    rotate: 0,
    startTransform: null,
    currentAction: null,
  };

  _onStart = ({ target }) => {
    let action;

    if (target.dataset && target.dataset.action) {
      action = target.dataset.action;
    }

    if (!action) {
      this.setState({ enabled: false });
    } else {
      this.setState(({ width, height, translateX, translateY, rotate }) => ({
        currentAction: action,
        startTransform: { width, height, translateX, translateY, rotate },
      }));
    }
  };
  _onMove = ({ translation }) => {
    this.setState(({ currentAction, startTransform }) => {
      if (currentAction === 'translate') {
        return {
          translateX: startTransform.translateX + translation.x,
          translateY: startTransform.translateY + translation.y,
        };
      }
      if (currentAction === 'scale') {
        return {
          width: Math.max(100, startTransform.width + translation.x),
          height: Math.max(100, startTransform.height + translation.y),
        };
      }
      if (currentAction === 'rotate') {
        return { rotate: calculateRotate(startTransform.rotate, translation) };
      }
      return null;
    });
  };
  _onEnd = () => {
    this.setState({ currentAction: null, startTransform: null });
  };
  _onCancel = evt => {
    this.setState({ enabled: true });
  };
  _onClick = evt => {
    this.setState({ hidden: true });
  };

  render() {
    const {
      enabled,
      hidden,
      translateX,
      translateY,
      width,
      height,
      rotate,
    } = this.state;
    return (
      <div className="sticker-wrapper">
        <Pannable
          className="sticker-box"
          style={{
            display: hidden ? 'none' : 'block',
            width,
            height,
            ...getTransformStyle(translateX, translateY, rotate),
          }}
          enabled={enabled}
          onStart={this._onStart}
          onMove={this._onMove}
          onEnd={this._onEnd}
          onCancel={this._onCancel}
        >
          <div data-action="translate" className="sticker-translate" />
          <div className="sticker-remove" onClick={this._onClick} />
          <div data-action="scale" className="sticker-scale" />
          <div data-action="rotate" className="sticker-rotate" />
        </Pannable>
      </div>
    );
  }
}

function getTransformStyle(translateX, translateY, rotate) {
  return {
    transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate})`,
    WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
    msTransform: `translate(${translateX}px, ${translateY}px) rotate(${rotate})`,
  };
}

function calculateRotate(rotate, { x, y }) {
  const redirect = (x >= 0 && y >= 0) || (x <= 0 && y <= 0) ? 1 : -1;
  const c = redirect * Math.sqrt(x * x + y * y);
  console.log(c);
  return rotate + c;
}
