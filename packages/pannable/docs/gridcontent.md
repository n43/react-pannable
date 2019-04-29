# \<GridContent />

`GridContent` component displays data in grid layout.

## Usage

## Props

... [BaseContentProps](types.md#basecontentprops)

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

#### `renderItem`: (attrs: LayoutAttrs) => ReactNode

Returns a element by the layout attributes.

## APIs

## Types

#### `ItemProps` { key: string, forceRender: boolean, style: CSSProperties }

#### LayoutAttrs { itemIndex: number, rowIndex: number, columnIndex: number, rect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), visibleRect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), needsRender: boolean, Item: Component<ItemProps, any> };
