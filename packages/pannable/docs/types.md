## Types

#### `Size` { width: number, height: number }

The dimensions with width and height.

#### `Point` { x: number, y: number }

A point in a 2D coordinate system.

#### `Rect` { x: number, y: number, width: number, height: number }

a rectangle with the location and dimensions.

#### `Align` 'auto' | 'center' | 'start' | 'end' | number

Constants that indicate how to scroll a specific area into the visible portion.

#### `Align2D` { x: [Align](#align-auto--center--start--end--number), y: [Align](#align-auto--center--start--end--number) } | [Align](#align-auto--center--start--end--number)

An alignment in a 2D coordinate system.

## BaseContentProps

... `div` props

#### `width`?: number

The width of the component. If not specified, it shrinks to fit the space available.

#### `height`?: number

The height of the component. If not specified, it shrinks to fit the space available.

#### `visibleRect`?: [Rect](#rect--x-number-y-number-width-number-height-number-)

The visible rectangle of the content.

#### `connectWithPad`?: boolean

Determines whether connect with the [Pad](pad.md) component automatically.

#### `onResize`?: (size: [Size](#size--width-number-height-number-)) => void

Calls when changes the size of the component.
