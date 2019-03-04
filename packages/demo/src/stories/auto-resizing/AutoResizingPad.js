import React from 'react';
import { AutoResizing } from 'react-pannable';

export default class AutoResizingPad extends React.Component {
  render() {
    return (
      <div style={{ display: 'flex', height: 300 }}>
        <div style={{ flex: 1 }}>
          <AutoResizing>
            {({ width, height }) => (
              <div style={{ width, height, backgroundColor: '#ccc' }} />
            )}
          </AutoResizing>
        </div>
        <div style={{ flex: 1 }} />
      </div>
    );
  }
}
