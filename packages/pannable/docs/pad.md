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

#### `onScroll`?: (evt: [PadEvent](#padevent--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when the content scrolls.

#### `onDragStart`?: (evt: [PadEvent](#padevent--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when dragging started.

#### `onDragEnd`?: (evt: [PadEvent](#padevent--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when dragging ended.

#### `onDecelerationStart`?: (evt: [PadEvent](#padevent--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when decelerating started.

#### `onDecelerationEnd`?: (evt: [PadEvent](#padevent--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when decelerating ended.

#### `onContentResize`?: (evt: [PadEvent](#padevent--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when the content resizes.

## APIs

#### getVisibleRect()

#### setContentSize(size: [Size](#size--width-number-height-number-))

#### scrollTo({ offset: [Point](#point--x-number-y-number-), animated?: boolean })

#### scrollToRect({ rect: [Rect](#rect--x-number-y-number-width-number-height-number-), align: [Align](#point--x-number-y-number-), animated?: boolean })

## Types

#### `Point`: { x: number, y: number }

#### `Size`: { width: number, height: number }

#### `Rect`: { x: number, y: number, width: number, height: number }

#### AlignEnum: 'auto' | 'center' | 'start' | 'end' | number

#### Align: { x: [AlignEnum](alignenum--auto-center-start-end-number-), y: [AlignEnum](alignenum--auto-center-start-end-number-) } | [AlignEnum](alignenum--auto-center-start-end-number-)

#### `PadEvent`: { contentOffset: [Point](#point--x-number-y-number-), contentVelocity: [Point](#point--x-number-y-number-), size: [Size](#size--width-number-height-number-), contentSize: [Size](#size--width-number-height-number-), dragging: boolean, decelerating: boolean }
