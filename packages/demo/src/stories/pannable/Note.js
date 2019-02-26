import React from 'react';
import { Pannable } from 'react-pannable';
import './Note.css';

export default class Note extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      enabled: true,
      dragTarget: null,
      dragStartPosition: null,
      items: {
        item0: { x: 10, y: 10 },
        item1: { x: 140, y: 10 },
      },
    };
    this.pannableRef = React.createRef();
  }
  _onStart = ({ target }) => {
    let key;

    while (!key && target && target !== this.pannableRef.current) {
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

      if (position.x < 0 || position.y < 0) {
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
    const { enabled, items } = this.state;

    return (
      <Pannable
        className="note-wrapper"
        enabled={enabled}
        onStart={this._onStart}
        onMove={this._onMove}
        onEnd={this._onEnd}
        onCancel={this._onCancel}
      >
        <div
          data-draggable="item0"
          className="note-item"
          style={getPositionStyle(items['item0'])}
        >
          <div>
            In this guide, we will examine the building blocks of React apps:
            <a href="https://github.com/n43/react-pannable" target="blank">
              elements and components.
            </a>
          </div>
        </div>
        <div
          data-draggable="item1"
          className="note-item"
          style={getPositionStyle(items['item1'])}
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
