import React from 'react';
import { Pannable } from 'react-pannable';
import SvgDelete from './SvgDelete';
import SvgScale from './SvgScale';
import SvgRotate from './SvgRotate';
import SvgPan from './SvgPan';
import SvgSticker from './SvgSticker';
import './Sticker.css';

export default class Sticker extends React.Component {
  state = {
    hidden: false,
    width: 300,
    height: 300,
    translateX: 100,
    translateY: 100,
    rotate: 0,
    startTransform: null,
    currentAction: null,
  };

  _shouldStart = ({ target }) => {
    let action;

    if (target.dataset && target.dataset.action) {
      action = target.dataset.action;
    }

    if (!action) {
      return false;
    }

    this.setState(({ width, height, translateX, translateY, rotate }) => ({
      currentAction: action,
      startTransform: { width, height, translateX, translateY, rotate },
    }));

    return true;
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
        return { rotate: calculateRotate(startTransform, translation) };
      }
      return null;
    });
  };
  _onEnd = () => {
    this.setState({ currentAction: null, startTransform: null });
  };
  _onClick = evt => {
    this.setState({ hidden: true });
  };
  _onShowSticker = evt => {
    this.setState({
      hidden: false,
      width: 300,
      height: 300,
      translateX: 100,
      translateY: 100,
      rotate: 0,
      startTransform: null,
      currentAction: null,
    });
  };

  render() {
    const {
      hidden,
      translateX,
      translateY,
      width,
      height,
      rotate,
      currentAction,
    } = this.state;
    return (
      <div className="sticker-wrapper">
        <div className="sticker-optbar">
          {hidden && (
            <div className="sticker-btn" onClick={this._onShowSticker}>
              Show Sticker
            </div>
          )}
        </div>
        <Pannable
          className={currentAction ? 'sticker-box-dragging' : 'sticker-box'}
          style={{
            display: hidden ? 'none' : 'block',
            width,
            height,
            ...getTransformStyle(translateX, translateY, rotate),
          }}
          shouldStart={this._shouldStart}
          onMove={this._onMove}
          onEnd={this._onEnd}
        >
          <SvgSticker width={width} height={height} />

          <SvgPan data-action="translate" className="sticker-translate" />
          <SvgDelete className="sticker-remove" onClick={this._onClick} />
          <SvgScale data-action="scale" className="sticker-scale" />
          <SvgRotate data-action="rotate" className="sticker-rotate" />
        </Pannable>
      </div>
    );
  }
}

function getTransformStyle(translateX, translateY, rotate) {
  return {
    transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate})`,
    WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}rad)`,
    msTransform: `translate(${translateX}px, ${translateY}px) rotate(${rotate})`,
  };
}

function calculateRotate({ rotate, width, height }, { x, y }) {
  const sr = 0.5 * Math.sqrt(width * width + height * height);
  const sx = -Math.cos(rotate - 0.25 * Math.PI) * sr;
  const sy = -Math.sin(rotate - 0.25 * Math.PI) * sr;
  const ex = sx + x;
  const ey = sy + y;
  const er = Math.sqrt(ex * ex + ey * ey);
  const redirect = ey >= 0 ? 1 : -1;

  return -redirect * Math.acos(-ex / er) + 0.25 * Math.PI;
}
