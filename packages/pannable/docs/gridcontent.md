# \<GridContent />

`GridContent` component displays data in grid layout. It provides the items that display the actual content.

## Usage

```js
import React from 'react';
import { Pad, GridContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width={300} height={400} alwaysBounceX={false}>
        <GridContent
          width={300}
          itemWidth={80}
          itemHeight={80}
          itemCount={100}
          renderItem={({ Item }) => (
            <Item hash="img">
              <img src="beauty.jpg" width="80" height="80" />
            </Item>
          )}
        />
      </Pad>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/EJJjYe)

## Props

#### `width`?: number

The width of the component. If not specified, it shrinks to fit the space available.

#### `height`?: number

The height of the component. If not specified, it shrinks to fit the space available.

#### `direction`?: 'x' | 'y'

The layout direction of the content. The default value is `y`.

#### `rowSpacing`?: number

The minimum spacing to use between rows.

#### `columnSpacing`?: number

The minimum spacing to use between columns.

#### `itemCount`: number

The number of items.

#### `itemWidth`: number

The width of items.

#### `itemHeight`: number

The height of items.

#### `renderItem`: (attrs: [LayoutAttrs](#layoutattrs--itemindex-number-rowindex-number-columnindex-number-rect-rect-visiblerect-rect-needsrender-boolean-item-componentitemprops-any-)) => ReactNode

Returns the React element that corresponds to the specified item.

## Types

#### `ItemProps` { key: string, forceRender: boolean, style: CSSProperties }

#### LayoutAttrs { itemIndex: number, rowIndex: number, columnIndex: number, rect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), visibleRect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), needsRender: boolean, Item: Component<[ItemProps](#itemprops--key-string-forcerender-boolean-style-cssproperties-), any> };
