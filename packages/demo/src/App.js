import React, { Component } from 'react';
import { Gallery } from 'react-virtualized-gallery';

class App extends Component {
  render() {
    return (
      <Gallery
        width={300}
        height={200}
        cellRenderer={({ key, style }) => <div key={key} style={style} />}
        columnCount={1}
        rowCount={1}
        columnWidth={100}
        rowHeight={100}
      />
    );
  }
}

export default App;
