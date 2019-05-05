# \<ItemContent />

`ItemContent` component displays data with the size best fits the specified size. In most cases, it is not used directly.

## Props

... `div` props

#### `width`?: number

The width of the component. If not specified, it shrinks to fit the space available.

#### `height`?: number

The height of the component. If not specified, it shrinks to fit the space available.

#### `visibleRect`?: [Rect](types.md#rect--x-number-y-number-width-number-height-number-)

The visible rectangle of the content.

#### `connectWithPad`?: boolean

Determines whether connect with the [`Pad`](pad.md) component automatically.

#### `onResize`?: (size: [Size](types.md#size--width-number-height-number-)) => void

Calls when changes the size of the component.

## APIs

#### calculateSize()

Calculates the size of the component manually.
