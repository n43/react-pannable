import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from './TextField';
import './Pad.css';

class BasicScroll extends Component {
  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };
  renderContent() {
    const items = [];

    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        const style = {
          position: 'absolute',
          top: row * 552,
          left: column * 346,
          width: 346,
          height: 552,
          backgroundColor: (row + column) % 2 ? '#defdff' : '#cbf1ff',
        };

        items.push(<div key={row + '-' + column} style={style} />);
      }
    }

    return items;
  }

  render() {
    return (
      <div className="pad-main">
        <div className="pad-preview">
          <SvgPhone className="pad-preview-bg" />
          <div className="pad-preview-content">
            <Pad
              width={346}
              height={552}
              contentWidth={346 * 5}
              contentHeight={552 * 5}
              pagingEnabled
            >
              {this.renderContent()}
            </Pad>
          </div>
        </div>
        <div className="pad-optbar">
          <TextField
            name="scrollTo"
            value={0}
            placeholder="integer"
            onChange={this.handleInputChange}
          />
          <div>
            <label className="note-opt">
              <input
                type="checkbox"
                checked={false}
                onChange={this.handleInputChange}
              />{' '}
              pagingEnabled
            </label>
          </div>
          <div>
            <label className="note-opt">
              <input
                type="checkbox"
                checked={false}
                onChange={this.handleInputChange}
              />{' '}
              scrollEnabled
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicScroll;
