# \<Player />

`Player` component manages to scroll with one page automatically in a loop.

## Usage

```js
import React from 'react';
import { Player } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Player
        width={300}
        height={400}
        direction="x"
        loop={true}
        autoplayEnabled={true}
      >
        <div style={{ width: 900, height: 400 }}>
          <div
            style={{
              display: 'inline-block',
              width: 300,
              height: 400,
              background: '#ccc',
            }}
          />
          <div
            style={{
              display: 'inline-block',
              width: 300,
              height: 400,
              background: '#ddd',
            }}
          />
          <div
            style={{
              display: 'inline-block',
              width: 300,
              height: 400,
              background: '#eee',
            }}
          />
        </div>
      </Player>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/MRzPXw)

## Props

... [Pad](pad.md) props

#### `width`: number

the width of the component.

#### `height`: number

the height of the component.

#### `direction`?: 'x' | 'y'

The scrolling direction of the player. The default value is `x`.

#### `autoplayEnabled`?: boolean

Determines whether player is endable to scroll automatically. The default value is `true`

#### `autoplayInterval`?: number

Interval of two automatic scroll(in ms). The default value is `3000`

#### `loop`?: boolean

Determines whether continuous loop mode is enabled. The default value is `true`

## APIs

#### go({delta: number, animated?: boolean})

Scrolls the content with the specified times of width or height.
Whether `delta` is greater than 0, determines the direction of scroll.

#### rewind()

Scrolls to the previous view.

#### forward()

Scrolls to the next view.
