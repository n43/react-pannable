import React, { Component } from 'react';
import { Gallery } from 'react-virtualized-gallery';

class App extends Component {
  render() {
    return (
      <Gallery
        width={300}
        height={200}
        renderer={({ key, index, style }) => {
          const colors = ['#000', '#333', '#666', '#999', '#ccc'];
          style.backgroundColor = colors[index];

          return <div key={key} style={style} />;
        }}
        direction="row"
        count={5}
        inset={100}
      />
    );
  }
}

export default App;
