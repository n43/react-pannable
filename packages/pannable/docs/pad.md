# \<Pad />

`Pad` component handles scrolling of content. it tracks the movements of the touch/mouse and adjusts the origin accordingly. by default, it bounces back when scrolling exceeds the bounds of the content.

## Usage

```js
import React from 'react';
import { Pad } from 'react-pannable';

class Page extends React.Component {
  render() {
    return <Pad />;
  }
}
```

## Props

... [`Pannable`](pannable.md) props
