# \<ItemContent />

## Usage

```js
import React from 'react';
import { Pad, ItemContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width="300" height="400">
        <ItemContent width="1000">
          <div>Some thing of constant size.</div>
        </ItemContent>
      </Pad>
    );
  }
}
```

## Props

#### `width`?: number

The width of the component. If not specified, it shrinks to fit the space available.

#### `height`?: number

The height of the component. If not specified, it shrinks to fit the space available.

#### `visibleRect`?: [Rect](#rect--x-number-y-number-width-number-height-number-)

The visible rectangle of the content.

#### `connectWithPad`?: boolean

Determines whether connect with the [Pad](pad.md) component automatically.

#### `onResize`?: (size: [Size](#size--width-number-height-number-)) => void

Calls when changes the size of the component.

## APIs

#### calculateSize()

Calculates the size of the component manually.

## Interfaces

#### `Size` { width: number, height: number }

#### `Rect` { x: number, y: number, width: number, height: number }
