# \<Player />

`Player` component manages to play content automatically in a loop. In the autoplay mode, it will play with one page size.

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

#### `direction`?: 'x' | 'y'

The playing direction of the player. The default value is `x`.

#### `width`: number

the width of the component.

#### `height`: number

the height of the component.

#### `autoplayEnabled`?: (size: [Size](types.md#size--width-number-height-number-)) => void

Calls when changes the size of the component.

## APIs

#### calculateSize()

Calculates the size of the component manually.
