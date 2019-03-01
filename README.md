# react-pannable

Simulate pan gesture and scroll view for touch devices with [`React`](https://facebook.github.io/react/)

[![npm version](https://img.shields.io/npm/v/react-pannable.svg)](https://www.npmjs.com/package/react-pannable)
![npm license](https://img.shields.io/npm/l/react-pannable.svg?style=flat)

## Getting started

Install `react-pannable` using npm.

```shell
npm install --save react-pannable
```

## Examples

[All the examples!](https://n43.github.io/react-pannable-demo/)

`Pannable` demos

- [Note](https://n43.github.io/react-pannable-demo/?selectedKind=Pannable&selectedStory=Note&full=0&addons=0&stories=1&panelRight=0)
- [Sticker](https://n43.github.io/react-pannable-demo/?selectedKind=Pannable&selectedStory=Sticker&full=0&addons=0&stories=1&panelRight=0)

`Pad` demos

- [Basic Scroll](https://n43.github.io/react-pannable-demo/?selectedKind=Pad&selectedStory=basic%20scroll&full=0&addons=0&stories=1&panelRight=0)
- [Auto Resizing](https://n43.github.io/react-pannable-demo/?selectedKind=Pad&selectedStory=filling%20parent%20space&full=0&addons=0&stories=1&panelRight=0)
- [Layout With General Content Mode](https://n43.github.io/react-pannable-demo/?selectedKind=Pad&selectedStory=using%20general%20content%20layout&full=0&addons=0&stories=1&panelRight=0)

## API Reference

### Pannable

`Pannable` provides a pan gesture simulation on recent mobile browsers for iOS and Android. It can also be used on mouse-base devices across on all evergreen browsers.

```js
type Point = { x: number, y: number };
type PanEvent = {
  translation: Point,
  velocity: Point,
  target: HTMLElement,
};
```

#### Prop Types

| Property    |       Type       | DefaultValue | Description                                                                                                                                                   |
| :---------- | :--------------: | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| enabled     |     boolean      |     true     | Indicate whether the gesture listener is enabled. If you change this property to `false` while the gesture is listening, the gesture transitions to `cancel`. |
| shouldStart | boolean,function |     true     | Whether to start gesture listening. : `(evt: PanEvent) => void`                                                                                               |
| onStart     |     function     |   () => {}   | Callback invoked when the gesture starts listening.: `(evt: PanEvent) => void`                                                                                |
| onMove      |     function     |   () => {}   | Callback invoked when the gesture moves.: `(evt: PanEvent) => void`                                                                                           |
| onEnd       |     function     |   () => {}   | Callback invoked when the gesture ended listening.: `(evt: PanEvent) => void`                                                                                 |
| onCancel    |     function     |   () => {}   | Callback invoked when the gesture cancelled.: `(evt: PanEvent) => void`                                                                                       |

### Pad

`Pad` provides a scrollable content component on which overflow scrollbars are not natively supported. It also provides paging scroll implementation and multiple content layout mode.

```js
type Point = { x: number, y: number };
type Size = { width: number, height: number };
type PadEvent = {
  contentOffset: Point,
  contentVelocity: Point,
  dragging: boolean,
  decelerating: boolean,
  size: Size,
  contentSize: Size,
};
```

#### Prop Types

| Property      |   Type   | DefaultValue | Description                                                                 |
| :------------ | :------: | :----------: | :-------------------------------------------------------------------------- |
| scrollEnabled | boolean  |     true     | Determines whether scrolling is enabled.                                    |
| pagingEnabled | boolean  |    false     | Determines whether paging is enabled for the pad.                           |
| width         |  number  |      0       | The width of the bounding view.                                             |
| height        |  number  |      0       | The height of the bounding view.                                            |
| contentWidth  |  number  |      0       | The width of the content view.                                              |
| contentHeight |  number  |      0       | The height of the content view.                                             |
| contentProps  |  object  |      {}      | The props of the content view.                                              |
| onScroll      | function |   () => {}   | Callback invoked when the content view scrolls.:`({evt: PadEvent}) => void` |

#### Public Methods

##### scrollTo({ offset: Point, animated: boolean })

Sets the offset from the content view’s origin.

### GeneralContent

`GeneralContent` automatically adjusts the width and height of content.

#### Prop Types

| Property |       Type        | DefaultValue | Description                                                                                                     |
| :------- | :---------------: | :----------: | :-------------------------------------------------------------------------------------------------------------- |
| children |     function      |  () => null  | Function responsible for rendering children.:`({ content: element, width: number, height: number }) => element` |
| content  | element,component |     null     | Rendered content. Can be a react component class, a render function, or a rendered element.                     |
| width    |      number       |      -1      | The width of the content.If you set this property to `-1`, it shrinks the content's width.                      |
| height   |      number       |      -1      | The height of the content.If you set this property to `-1`, it shrinks the content's height.                    |

## License

[MIT License](./LICENSE)
