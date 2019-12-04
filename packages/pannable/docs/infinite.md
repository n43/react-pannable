# \<Infinite />

`Infinite` component used to display a long list of data.

## Usage

```js
import React from 'react';
import { Infinite } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Infinite
        width={350}
        height={500}
        itemCount={5}
        renderItem={({ itemIndex }) => {
          const style = {
            height: `${20 * (itemIndex + 1)}px`,
          };

          return <div style={style}>{itemIndex}</div>;
        }}
      />
    );
  }
}
```

## Props

... [`Pad`](pad.md#props) props

#### `direction`?: 'x' | 'y'

The layout direction of the content. The default value is `y`.

#### `spacing`?: number

The minimum spacing to use between items.

#### `itemCount`: number

The number of items.

#### `estimatedItemWidth`?: number ｜ (itemIndex: number) => number

The estimated width of items.

#### `estimatedItemHeight`?: number ｜ (itemIndex: number) => number

The estimated height of items.

#### `renderItem`: (attrs: [ListItemAttrs](listcontent.md#listitemattrs--itemindex-number-rect-rect-visiblerect-rect-needsrender-boolean-item-componentitemprops-any-)) => ReactNode

Returns the React element that corresponds to the specified item.

#### `renderHeader`: (attrs: [ListItemAttrs](listcontent.md#listitemattrs--itemindex-number-rect-rect-visiblerect-rect-needsrender-boolean-item-componentitemprops-any-)) => ReactNode

Returns the React element that corresponds to the header.

#### `renderFooter`: (attrs: [ListItemAttrs](listcontent.md#listitemattrs--itemindex-number-rect-rect-visiblerect-rect-needsrender-boolean-item-componentitemprops-any-)) => ReactNode

Returns the React element that corresponds to the footer.

#### `scrollToIndex`?: { index?: number, align: [Align2D](types.md#align2d--x-align-y-align---align), animated: boolean }

Scrolls to the specified index of item.
