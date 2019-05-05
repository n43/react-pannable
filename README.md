# react-pannable

Flexible and Customizable Layouts for Scrolling Content with [`React`](https://facebook.github.io/react/)

[![npm version](https://img.shields.io/npm/v/react-pannable.svg)](https://www.npmjs.com/package/react-pannable)
![npm license](https://img.shields.io/npm/l/react-pannable.svg?style=flat)

## Getting started

Install `react-pannable` using npm.

```shell
npm install --save react-pannable
```

## API Reference

#### [`<Pannable />`](/packages/pannable/docs/pannable.md) - Can be panned(dragged) around with the touch/mouse

#### [`<Pad />`](/packages/pannable/docs/pad.md) - Handles scrolling of content

- [`<ItemContent />`](/packages/pannable/docs/itemcontent.md) - Displays data with the size best fits the specified size
- [`<GeneralContent />`](/packages/pannable/docs/generalcontent.md) - Similar to `ItemContent` and automatically resizes when the data change
- [`<ListContent />`](/packages/pannable/docs/listcontent.md) - Displays data in a single column/row
- [`<GridContent />`](/packages/pannable/docs/gridcontent.md) - Displays data in grid layout

#### [`<Carousel />`](/packages/pannable/docs/carousel.md) - Used to play a number of looping items in sequence

- [`<Player />`](/packages/pannable/docs/player.md) - Used to manage the playback of the paging content

## Examples

[All the examples!](https://n43.github.io/react-pannable/)

Some `Pannable` demos

- [Draggable Notes](https://n43.github.io/react-pannable/?path=/story/pannable--note)
- [Adjustable Sticker](https://n43.github.io/react-pannable/?path=/story/pannable--sticker)

Some `Pad` demos

- [Scrollable Content](https://n43.github.io/react-pannable/?path=/story/pad--scrollable-content)
- [Locating Specified Content](https://n43.github.io/react-pannable/?path=/story/pad--locating-specified-content)
- [Auto Resizing with Pad](https://n43.github.io/react-pannable/?path=/story/pad--auto-resizing-with-pad)
- [Layout with General Content](https://n43.github.io/react-pannable/?path=/story/pad--layout-with-general-content)
- [Layout with Grid Content](https://n43.github.io/react-pannable/?path=/story/pad--layout-with-grid-content)
- [Layout with List Content](https://n43.github.io/react-pannable/?path=/story/pad--layout-with-list-content)
- [Layout with Nested Content](https://n43.github.io/react-pannable/?path=/story/pad--layout-with-nested-content)

## License

[MIT License](/LICENSE)
