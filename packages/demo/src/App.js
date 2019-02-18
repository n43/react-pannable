import React, { Component } from 'react';
import { Pad } from 'react-pannable';

class App extends Component {
  renderColumns(flag) {
    const columns = [];

    for (let idx = 0; idx < 9; idx++) {
      const style = {
        display: 'inline-block',
        width: 60,
        height: 60,
        verticalAlign: 'top',
        backgroundColor: (idx + flag) % 2 ? '#000' : '#ccc',
      };
      columns.push(<div key={idx} style={style} />);
    }

    return columns;
  }

  renderRows() {
    const rows = [];

    for (let idx = 0; idx < 9; idx++) {
      const style = {
        whiteSpace: 'nowrap',
      };
      rows.push(
        <div key={idx} style={style}>
          {this.renderColumns(idx % 2)}
        </div>
      );
    }

    return rows;
  }

  render() {
    return (
      <Pad width={300} height={400} contentWidth={540} contentHeight={540}>
        {this.renderRows()}
      </Pad>
    );
  }
}

export default App;
