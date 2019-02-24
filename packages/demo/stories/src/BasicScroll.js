import React, { Component } from 'react';
import { Pad } from 'react-pannable';

class BasicScroll extends Component {
  renderContent() {
    const items = [];

    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        const style = {
          position: 'absolute',
          top: row * 400,
          left: column * 300,
          width: 300,
          height: 400,
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
        height={400}
        contentWidth={300 * 5}
        contentHeight={400 * 5}
        // pagingEnabled
      >
        {this.renderContent()}
      </Pad>
    );
  }
}

export default BasicScroll;
