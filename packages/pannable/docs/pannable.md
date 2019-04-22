# \<Pannable />

`Pannable` component can be panned(dragged) around with one finger. You can implement the event handlers for this gesture recognizer with current translation and velocity.

## Usage

```js
import React from 'react';
import { Pannable } from 'react-pannable';

class Page extends React.Component {
  state = {
    pos: { x: 0, y: 0 },
    startPos: null,
  };

  _onStart = () => {
    this.setState(({ pos }) => ({ startPos: pos }));
  };
  _onMove = ({ translation }) => {
    this.setState(({ startPos }) => ({
      pos: {
        x: startPos.x + translation.x,
        y: startPos.y + translation.y,
      },
    }));
  };
  _onEnd = () => {
    console.log('End', this.state.pos);
  };
  _onCancel = () => {
    this.setState(({ startPos }) => ({ pos: startPos }));
  };

  render() {
    const { pos } = state;

    return (
      <Pannable
        style={{
          position: 'absolute',
          top: pos.y,
          left: pos.x,
          width: 300,
          height: 300,
        }}
        onStart={this._onStart}
        onMove={this._onMove}
        onEnd={this._onEnd}
        onCancel={this._onCancel}
      />
    );
  }
}
```

## Props

... `div` props

#### `enabled`?: boolean

Determines whether the pan gesture recognizer is enabled. If set to `false` while the pan gesture recognizer is currently recognizing, it transitions to a cancelled state.

#### `shouldStart`?: (evt: [PanEvent](#panevent--translation-point-velocity-point-interval-number-target-htmlelement-)) => boolean

Calls whether to recognize a pan.

#### `onStart`?: (evt: [PanEvent](#panevent--translation-point-velocity-point-interval-number-target-htmlelement-)) => void

Calls when the finger has moved enough to be considered a pan.

#### `onMove`?: (evt: [PanEvent](#panevent--translation-point-velocity-point-interval-number-target-htmlelement-)) => void

Calls when the finger moves.

#### `onEnd`?: (evt: [PanEvent](#panevent--translation-point-velocity-point-interval-number-target-htmlelement-)) => void

Calls when the finger is lifted.

#### `onCancel`?: (evt: [PanEvent](#panevent--translation-point-velocity-point-interval-number-target-htmlelement-)) => void

Calls when a system event cancels the recognizing pan.

## Types

#### `Point`: { x: number, y: number }

#### `PanEvent`: { translation: [Point](#point--x-number-y-number-), velocity: [Point](#point--x-number-y-number-), interval: number, target: HTMLElement }
