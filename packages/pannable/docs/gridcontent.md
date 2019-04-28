# \<GridContent />

## Usage

## Props

... [BaseContentProps](types.md#basecontentprops)

#### `direction`?: 'x' | 'y'

#### `rowSpacing`?: number

#### `columnSpacing`?: number

#### `itemCount`: number

#### `itemWidth`: number

#### `itemHeight`: number

#### `renderItem`: (attrs: LayoutAttrs) => ReactNode

## APIs

## Types

#### `ItemProps` { key: string, forceRender: boolean, style: CSSProperties }

#### LayoutAttrs { itemIndex: number, rowIndex: number, columnIndex: number, rect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), visibleRect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), needsRender: boolean, Item: Component<ItemProps, any> };
