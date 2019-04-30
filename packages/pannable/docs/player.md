# \<Player />

`Player` component used to manage the playback of the paging content.

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
              background: '#95ddff',
            }}
          />
          <div
            style={{
              display: 'inline-block',
              width: 300,
              height: 400,
              background: '#48b2e4',
            }}
          />
          <div
            style={{
              display: 'inline-block',
              width: 300,
              height: 400,
              background: '#0174ab',
            }}
          />
        </div>
      </Player>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/qwvNLp)

## Props

... [`Pad`](pad.md) props

#### `direction`?: 'x' | 'y'

The scroll direction of the player. The default value is `x`.

#### `autoplayEnabled`?: boolean

Determines whether the player should automatically playback. The default value is `true`

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
