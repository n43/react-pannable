# \<GridContent />

## Usage

## Props

#### `direction`?: 'x' | 'y'

#### `width`?: number

#### `height`?: number

#### `rowSpacing`?: number

#### `columnSpacing`?: number

#### `itemCount`: number

#### `itemWidth`: number

#### `itemHeight`: number

#### `renderItem`: (attrs: LayoutAttrs) => ReactNode

#### `visibleRect`?: [Rect](#rect--x-number-y-number-width-number-height-number-)

The visible rectangle of the content.

#### `connectWithPad`?: boolean

Determines whether connect with the [Pad](pad.md) component automatically.

#### `onResize`?: (size: [Size](#size--width-number-height-number-)) => void

Calls when changes the size of the component.

## APIs

## Interfaces

#### `Size` { width: number, height: number }

#### `Rect` { x: number, y: number, width: number, height: number }

#### `ItemProps` { key: string, forceRender: boolean, style: CSSProperties }

#### LayoutAttrs { itemIndex: number, rowIndex: number, columnIndex: number, rect: Rect, visibleRect: Rect, needsRender: boolean, Item: Component<ItemProps> };
