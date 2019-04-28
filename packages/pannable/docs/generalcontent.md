# \<GeneralContent />

# Usage

```js
import React from 'react';
import { Pad, GeneralContent } from 'react-pannable';

class Page extends React.Component {
  render() {
    return (
      <Pad width={300} height={400}>
        <GeneralContent width={1000}>
          <img src="beauty.jpg" width="1000" />
        </GeneralContent>
      </Pad>
    );
  }
}
```

[![Try it on CodePen](https://img.shields.io/badge/CodePen-Run-blue.svg?logo=CodePen)](https://codepen.io/cztflove/pen/qwvNLp)

Props and APIs are the same as [ItemContent](itemcontent.md)
