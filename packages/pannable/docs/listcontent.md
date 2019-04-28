# \<ListContent />

## Usage

## Props

... [BaseContentProps](types.md#basecontentprops)

#### `direction`?: 'x' | 'y'

#### `spacing`?: number

#### `itemCount`: number

#### `estimatedItemWidth`?: number

#### `estimatedItemHeight`?: number

#### `renderItem`: (attrs: LayoutAttrs) => ReactNode

## APIs

## Types

#### `ItemProps` { key: string, hash: string, forceRender: boolean, style: CSSProperties }

#### LayoutAttrs { itemIndex: number, rect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), visibleRect: [Rect](types.md#rect--x-number-y-number-width-number-height-number-), needsRender: boolean, Item: Component<ItemProps, any> };
