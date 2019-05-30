import React from 'react';
import { Pannable } from 'react-pannable';
import SvgNote from './SvgNote';
import clsx from 'clsx';
import './Note.css';

const winW = window.document.body.clientWidth;

const WRAPPER_WIDTH = winW > 680 ? 680 : 375;
const WRAPPER_HEIGHT = 510;
const ITEM_WIDTH = WRAPPER_WIDTH === 680 ? 200 : 150;
const ITEM_HEIGHT = ITEM_WIDTH;

function getItemKey(target) {
  if (target.dataset) {
    if (target.dataset.wrapper) {
      return null;
    }

    if (target.dataset.draggable) {
      return target.dataset.draggable;
    }
  }

  return getItemKey(target.parentNode);
}

export default class Note extends React.Component {
  state = {
    enabled: true,
    constrainted: true,
    dragTarget: null,
    dragStartPosition: null,
    items: {
      item0: { x: 20, y: 20 },
      item1: { x: ITEM_WIDTH + 40, y: 20 },
    },
  };

  _onConstraintedChange = () => {
    this.setState(({ constrainted }) => ({ constrainted: !constrainted }));
  };

  _shouldStart = ({ target }) => {
    return !!getItemKey(target);
  };

  _onStart = ({ target }) => {
    let key = getItemKey(target);

    this.setState(({ items }) => {
      const item = items[key];

      return {
        dragTarget: key,
        dragStartPosition: { x: item.x, y: item.y },
      };
    });
  };

  _onMove = ({ translation }) => {
    this.setState(({ dragTarget, dragStartPosition, items, constrainted }) => {
      const position = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };

      let nextState = {
        items: {
          ...items,
          [dragTarget]: position,
        },
      };

      if (
        constrainted &&
        (position.x <= 0 ||
          position.x >= WRAPPER_WIDTH - ITEM_WIDTH ||
          position.y <= 0 ||
          position.y >= WRAPPER_HEIGHT - ITEM_HEIGHT)
      ) {
        nextState.enabled = false;
      }

      return nextState;
    });
  };

  _onEnd = () => {
    this.setState({ dragTarget: null, dragStartPosition: null });
  };

  _onCancel = () => {
    this.setState(({ dragTarget, dragStartPosition, items }) => {
      return {
        enabled: true,
        dragTarget: null,
        dragStartPosition: null,
        items: { ...items, [dragTarget]: dragStartPosition },
      };
    });
  };

  render() {
    const { enabled, constrainted, items, dragTarget } = this.state;

    return (
      <div>
        <div className="note-optbar">
          <label className="note-opt">
            <input
              type="checkbox"
              checked={!constrainted}
              onChange={this._onConstraintedChange}
            />{' '}
            Drag anywhere.
          </label>
        </div>
        <Pannable
          data-wrapper="wrapper"
          className="note-wrapper"
          style={{ width: WRAPPER_WIDTH, height: WRAPPER_HEIGHT }}
          enabled={enabled}
          shouldStart={this._shouldStart}
          onStart={this._onStart}
          onMove={this._onMove}
          onEnd={this._onEnd}
          onCancel={this._onCancel}
        >
          <div
            data-draggable="item0"
            className={clsx('note-item', {
              'note-item-dragging': dragTarget === 'item0',
            })}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              ...getPositionStyle(items['item0']),
            }}
          >
            <SvgNote width={ITEM_WIDTH} height={ITEM_HEIGHT} />
            <div className="note-itemcon">
              <div>You can drag me.</div>
              <div>
                And you can{' '}
                <a href="https://github.com/n43/react-pannable" target="blank">
                  open the link
                </a>
                .
              </div>
            </div>
          </div>
          <div
            className={clsx('note-item', {
              'note-item-dragging': dragTarget === 'item1',
            })}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              ...getPositionStyle(items['item1']),
            }}
          >
            <SvgNote width={ITEM_WIDTH} height={ITEM_HEIGHT} />
            <div className="note-itemcon">
              <div data-draggable="item1" className="note-trigger">
                Drag here
              </div>
              <div>You can only drag me by trigger.</div>
            </div>
          </div>
        </Pannable>
      </div>
    );
  }
}

function getPositionStyle(position) {
  return {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    WebkitTransform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    msTransform: `translate(${position.x}px, ${position.y}px)`,
  };
}
