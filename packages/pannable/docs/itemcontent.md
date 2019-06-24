# \<ItemContent />

`ItemContent` component displays data with the size best fits the specified size. In most cases, it is not used directly.

## Props

... `div` props

#### `width`?: number

The width of the component. If not specified, it shrinks to fit the space available.

#### `height`?: number

The height of the component. If not specified, it shrinks to fit the space available.

#### `children`: ReactNode | (size: [Size](types.md#size--width-number-height-number-), { getResizeNode: () => ReactElement | null, calculateSize: () => {} }) => ReactNode

You can implement render props for the component with current size.
