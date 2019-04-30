# \<ListContent />

`ListContent` component displays data in a single column/row. It provides the items that display the actual content.

## Usage

```js
import React from 'react';
import { Pad, ListContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width={300} height={400} alwaysBounceX={false}>
        <ListContent
          width={300}
          itemCount={100}
          renderItem={({ itemIndex }) => <div>{itemIndex}</div>}
        />
      </Pad>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/yrrNOv)

## Props

... [`ItemContent`](itemcontent.md#props) props

#### `direction`?: 'x' | 'y'

The layout direction of the content. The default value is `y`.

#### `spacing`?: number

The minimum spacing to use between items.

#### `itemCount`: number

The number of items.

#### `estimatedItemWidth`?: number

The estimated width of items.

#### `estimatedItemHeight`?: number

The estimated height of items.

#### `renderItem`: (attrs: [LayoutAttrs](#layoutattrs--itemindex-number-rect-rect-visiblerect-rect-needsrender-boolean-item-componentitemprops-any-)) => ReactNode

Returns a element by the layout attributes.

## APIs

## Types

#### `ItemProps` { key: string, hash: string, forceRender: boolean, style: CSSProperties }

#### `LayoutAttrs` { itemIndex: number, rect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), visibleRect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), needsRender: boolean, Item: Component<[ItemProps](#itemprops--key-string-hash-string-forcerender-boolean-style-cssproperties-), any> };
