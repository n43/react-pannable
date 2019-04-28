# \<ItemContent />

## Usage

```js
import React from 'react';
import { Pad, ItemContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width={300} height={400}>
        <ItemContent width={1000}>
          <div>Some thing of constant size.</div>
        </ItemContent>
      </Pad>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/qwvNLp)

## Props

... [BaseContentProps](types.md#basecontentprops)

## APIs

#### calculateSize()

Calculates the size of the component manually.
