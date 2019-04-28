# \<ListContent />

`ListContent` component displays data in a single column/row.

## Usage

## Props

... [BaseContentProps](types.md#basecontentprops)

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

#### `renderItem`: (attrs: LayoutAttrs) => ReactNode

Returns a element by the layout attributes.

## APIs

## Types

#### `ItemProps` { key: string, hash: string, forceRender: boolean, style: CSSProperties }

#### LayoutAttrs { itemIndex: number, rect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), visibleRect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), needsRender: boolean, Item: Component<ItemProps, any> };
