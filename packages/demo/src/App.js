import React, { Component } from 'react';
import { Pad } from 'react-pannable';

class App extends Component {
  renderContent() {
    const items = [];

    for (let row = 0; row < 9; row++) {
      for (let column = 0; column < 9; column++) {
        const style = {
          position: 'absolute',
          top: row * 110,
          left: column * 110,
          width: 110,
          height: 110,
          backgroundColor: (row + column) % 2 ? '#000' : '#ccc',
        };

        items.push(<div key={row + '-' + column} style={style} />);
      }
    }

    return items;
  }

  render() {
    return (
      <Pad
        width={300}
        height={600}
        contentWidth={990}
        contentHeight={990}
        contentStyle={{ position: 'relative' }}
      >
        {this.renderContent()}
      </Pad>
    );
  }
}

export default App;
