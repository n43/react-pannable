# <Pannable />

`Pannable` component can be panned(dragged) around with one finger. You can implement the event handlers for this gesture recognizer with current translation and velocity.

## Usage

```js
import { Pannable } from 'react-pannable';

<Pannable enabled />;
```

## Props

#### `enabled`?: boolean

Determines whether the pan gesture recognizer is enabled. If set to `false` while the pan gesture recognizer is currently recognizing, it transitions to a cancelled state.

#### `shouldStart`?: (evt: [PanEvent](#types)) => boolean

Calls whether to recognize a pan.

#### `onStart`?: (evt: [PanEvent](#types)) => void

Calls when the finger has moved enough to be considered a pan.

#### `onMove`?: (evt: [PanEvent](#types)) => void

Calls when the finger moves.

#### `onEnd`?: (evt: [PanEvent](#types)) => void

Calls when the finger is lifted.

#### `onCancel`?: (evt: [PanEvent](#types)) => void

Calls when a system event cancels the recognizing pan.

## Types

#### `Point`: { x: number, y: number }

#### `PanEvent`: { translation: [Point](#types), velocity: [Point](#types), interval: number, target: HTMLElement }
