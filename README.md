# react-pannable

Simulate pan gesture and scroll view for touch devices with [`React`](https://facebook.github.io/react/)

[![npm version](https://img.shields.io/npm/v/react-pannable.svg)](https://www.npmjs.com/package/react-pannable)
![npm license](https://img.shields.io/npm/l/react-pannable.svg?style=flat)

## Getting started

Install `react-pannable` using npm.

```shell
npm install --save react-pannable
```

## Documentation

### Pannable

`Pannable` provides a pan gesture simulation on recent mobile browsers for iOS and Android. It can also be used on mouse-base devices across on all evergreen browsers.

#### Prop Types
| Property | Type | Default | Description |
|:---|:---|:---|:---|
| enabled | Boolean | true | Indicate whether the gesture listener is enabled. If you change this property to `false` while the gesture is listening, the gesture transitions to cancel. |
| shouldStart | Boolean \| Function | true | |
| onStart | Function | ({ translation: Point, velocity: Point, target: HTMLElement }) => {} | Callback invoked when the gesture starts listening |
| onMove | Function | ({ translation: Point, velocity: Point, target: HTMLElement }) => {} | Callback invoked when the gesture moves |
| onEnd | Function | ({ translation: Point, velocity: Point, target: HTMLElement }) => {} | Callback invoked when the gesture ended |
| onCancel | Function | ({ translation: Point, velocity: Point, target: HTMLElement }) => {} | Callback invoked when the gesture cancelled |

### Pad

`Pad` provides a scrollable content component on which overflow scrollbars are not natively supported. It also provides paging scroll implementation and multiple content layout mode.

## License

[MIT License](./LICENSE)
