# \<Pad />

`Pad` component handles scrolling of content. it tracks the movements of the touch/mouse and adjusts the origin accordingly. by default, it bounces back when scrolling exceeds the bounds of the content.

## Usage

```js
import React from 'react';
import { Pad } from 'react-pannable';

class Page extends React.Component {
  render() {
    return <Pad />;
  }
}
```

## Props

... [`Pannable`](pannable.md) props

#### `width`: number

the width of the component.

#### `height`: number

the height of the component.

#### `pagingEnabled`?: boolean

Determines whether paging is enabled for the component.

#### `directionalLockEnabled`?: boolean

Determines whether scrolling is disabled in a particular direction.

#### `alwaysBounceX`?: boolean

Determines whether bouncing always occurs when horizontal scrolling reaches the end of the content.

#### `alwaysBounceY`?: boolean

Determines whether bouncing always occurs when vertical scrolling reaches the end of the content.

#### `onScroll`?: (evt: PadEvent) => void

#### `onDragStart`?: (evt: PadEvent) => void

#### `onDragEnd`?: (evt: PadEvent) => void

#### `onDecelerationStart`?: (evt: PadEvent) => void

#### `onDecelerationEnd`?: (evt: PadEvent) => void

#### `onContentResize`?: (evt: PadEvent) => void

## Types

#### `Point`: { x: number, y: number }

#### `Size`: { width: number, height: number }

#### `PadEvent`: { contentOffset: Point, contentVelocity: Point, size: Size, contentSize: Size, dragging: boolean, decelerating: boolean }
