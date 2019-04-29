# \<GeneralContent />

`GeneralContent` component is similar to `ItemContent` and automatically resizes when the data change.

# Usage

```js
import React from 'react';
import { Pad, GeneralContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width={500} height={350}>
        <GeneralContent width={1000}>
          <img src="beauty.jpg" width="1000" />
        </GeneralContent>
      </Pad>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/ROdKwL)

Props and APIs are the same as [`ItemContent`](itemcontent.md)
