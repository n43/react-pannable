import React from 'react';
import { Pannable } from 'react-pannable';
import clsx from 'clsx';
import './Note.css';

const WRAPPER_WIDTH = 680;
const WRAPPER_HEIGHT = 510;
const ITEM_WIDTH = 180;
const ITEM_HEIGHT = 120;

export default class Note extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      enabled: true,
      dragTarget: null,
      dragStartPosition: null,
      items: {
        item0: { x: 20, y: 20 },
        item1: { x: 220, y: 20 },
      },
    };
    this.pannableRef = React.createRef();
  }
  _onStart = ({ target }) => {
    let key;

    while (
      !key &&
      target &&
      target !== this.pannableRef.current.elemRef.current
    ) {
      if (target.dataset && target.dataset.draggable) {
        key = target.dataset.draggable;
      }
      target = target.parentNode;
    }

    if (key) {
      this.setState(({ items }) => {
        const item = items[key];

        return {
          dragTarget: key,
          dragStartPosition: { x: item.x, y: item.y },
        };
      });
    }
  };

  _onMove = ({ translation }) => {
    this.setState(({ dragTarget, dragStartPosition, items }) => {
      if (!dragTarget) {
        return null;
      }

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
        position.x <= 0 ||
        position.x >= WRAPPER_WIDTH - ITEM_WIDTH ||
        position.y <= 0 ||
        position.y >= WRAPPER_HEIGHT - ITEM_HEIGHT
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
    const { enabled, items, dragTarget } = this.state;

    return (
      <Pannable
        className="note-wrapper"
        style={{ width: WRAPPER_WIDTH, height: WRAPPER_HEIGHT }}
        enabled={enabled}
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
          <div>You can drag me in the box.</div>
          <div>
            <a href="https://github.com/n43/react-pannable" target="blank">
              Click me
            </a>
          </div>
        </div>
        <div
          data-draggable="item1"
          className={clsx('note-item', {
            'note-item-dragging': dragTarget === 'item1',
          })}
          style={{
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            ...getPositionStyle(items['item1']),
          }}
        />
      </Pannable>
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
