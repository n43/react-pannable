# \<Carousel />

`Carousel` is a convenience wrapper around [`Player`](player.md). Apart from inheriting Player's props, it also provides some special and useful methods and events.

## Usage

```js
import React from 'react';
import { Carousel } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Carousel
        width={500}
        height={350}
        direction="x"
        autoplayEnabled={true}
        loop={true}
        itemCount={5}
        renderItem={({ itemIndex }) => {
          const style = {
            height: '100%',
            backgroundColor: itemIndex % 2 ? '#defdff' : '#cbf1ff',
          };

          return <div style={style} />;
        }}
        onSlideChange={({ itemCount, activeIndex }) => {
          console.log(itemCount, activeIndex);
        }}
      />
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/JVVoma)

## Props

... [`Player`](player.md#props) props

#### `itemCount`: number

The number of items.

#### `renderItem`: (attrs: [`LayoutAttrs`](gridcontent.md#LayoutAttrs)) => ReactNode

Returns a element by the layout attributes.

#### `onSlideChange`?: (attrs: SlideAttrs) => void

Calls when the active item changes.

## APIs

#### slideTo({index: number, animated: boolean})

Slides to the specified item.

#### slidePrev()

Slides to the previous item.

#### slideNext()

Slides to the next item.

## Types

#### SlideAttrs { itemCount: number, activeIndex: number };
