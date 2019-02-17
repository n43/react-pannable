import React, { Component } from 'react';
import { Pad } from 'react-pannable';

class App extends Component {
  render() {
    return (
      <Pad width={300} height={400}>
        Hello <a href="https://baidu.com">World</a>!
      </Pad>
    );
  }
}

export default App;
