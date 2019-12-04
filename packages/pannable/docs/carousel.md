# \<Carousel />

`Carousel` component used to play a number of looping items in sequence.

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
      >
        {({ activeIndex }) => <div>{activeIndex}</div>}
      </Carousel>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/JVVoma)

## Props

... [`Player`](player.md#props) props

#### `itemCount`: number

The number of items.

#### `renderItem`: (attrs: [GridItemAttrs](gridcontent.md#girditemattrs--itemindex-number-rowindex-number-columnindex-number-rect-rect-visiblerect-rect-needsrender-boolean-item-componentitemprops-any-)) => ReactNode

Returns the React element that corresponds to the specified item.

#### `onActiveIndexChange`?: (attrs: [CarouselAttrs](#carouselattrs--itemcount-number-activeindex-number-)) => void

Calls when the active index changes.

#### `scrollToIndex`?: { index?: number | (attrs: [CarouselAttrs](#carouselattrs--itemcount-number-activeindex-number-)) => number, animated: boolean }

Scrolls to the specified index of item.

#### `children`?: ReactNode | (attrs: [CarouselAttrs](#carouselattrs--itemcount-number-activeindex-number-)) => ReactNode

You can add some controls with active index.

## Types

#### CarouselAttrs { itemCount: number, activeIndex: number };
