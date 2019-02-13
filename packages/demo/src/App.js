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
          const contentStyle = {
            width: '100%',
            height: '100%',
            backgroundColor: colors[index],
          };

          return (
            <div key={key} style={style}>
              <div style={contentStyle} />
            </div>
          );
        }}
        direction="row"
        count={5}
        inset={50}
      />
    );
  }
}

export default App;
