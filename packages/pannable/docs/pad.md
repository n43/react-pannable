# \<Pad />

`Pad` component handles scrolling of content. its origin is adjustable over the content. it tracks the movements of the touch/mouse and adjusts the origin accordingly. by default, it bounces back when scrolling exceeds the bounds of the content.

`Pad` component must know the size of the content so it knows when to stop scrolling. You should specify the content by defining one of the following components. These components can be nested to achieve some complex layouts.

- [`<ItemContent />`](itemcontent.md) - Displays data with the size best fits the specified size
- [`<ListContent />`](listcontent.md) - Displays data in a single column/row
- [`<GridContent />`](gridcontent.md) - Displays data in grid layout

## Usage

```js
import React from 'react';
import { Pad, ItemContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width={500} height={350}>
        <ItemContent width={1000}>
          <img src="beautiful.jpg" width="1000" />
        </ItemContent>
      </Pad>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/KYrRgQ)

## Props

... [`Pannable`](pannable.md#props) props

#### `width`: number

the width of the component.

#### `height`: number

the height of the component.

#### `pagingEnabled`?: boolean

Determines whether paging is enabled for the component.

#### `directionalLockEnabled`?: boolean

Determines whether scrolling is disabled in a particular direction.

#### `alwaysBounceX`?: boolean

Determines whether bouncing always occurs when horizontal scrolling reaches the end of the content. The default value is `true`.

#### `alwaysBounceY`?: boolean

Determines whether bouncing always occurs when vertical scrolling reaches the end of the content. The default value is `true`.

#### `onScroll`?: (evt: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when scrolls the content.

#### `onStartDragging`?: (evt: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when dragging started.

#### `onDragEnd`?: (evt: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when dragging ended.

#### `onStartDecelerating`?: (evt: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when decelerating started.

#### `onEndDecelerating`?: (evt: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when decelerating ended.

#### `onResizeContent`?: (evt: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => void

Calls when changes the size of the content.

#### `renderBackground`: (attrs: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => ReactNode

Returns the React element that corresponds to the background.

#### `renderOverlay`: (attrs: [PadAttrs](#padattrs--contentoffset-point-contentvelocity-point-size-size-contentsize-size-dragging-boolean-decelerating-boolean-)) => ReactNode

Returns the React element that corresponds to the overlay.

#### `scrollTo`?: { point?: [Point](types.md#point--x-number-y-number-), offset?: [Point](types.md#point--x-number-y-number-), rect?: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), align?: [Align2D](types.md#align2d--x-align-y-align---align), animated?: boolean }

Scrolls the content to the specified offset.

## Types

#### `PadAttrs` { contentOffset: [Point](types.md#point--x-number-y-number-), contentVelocity: [Point](types.md#point--x-number-y-number-), size: [Size](types.md#size--width-number-height-number-), contentSize: [Size](types.md#size--width-number-height-number-), dragging: boolean, decelerating: boolean }
