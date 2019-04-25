# \<AutoResizing />

## Usage

```js
import React from 'react';
import { AutoResizing, Pad } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <AutoResizing>
        {size => (
          <Pad width={size.width} height={size.height}>
            <div>Some thing...</div>
          </Pad>
        )}
      </AutoResizing>
    );
  }
}
```

## Props

#### `children`: ReactNode | (size: [Size](#size--width-number-height-number-)) => ReactNode

You can implement the function children prop for the component with current size.

#### `width`?: number

the width of the component. If not specified, it grows to fit the space available.

#### `height`?: number

the height of the component. If not specified, it grows to fit the space available.

#### `onResize`?: (size: [Size](#size--width-number-height-number-)) => void

Calls when changes the size of the component.

## APIs

#### calculateSize()

Calculates the size of the component manually.

## Types

#### `Size`: { width: number, height: number }
