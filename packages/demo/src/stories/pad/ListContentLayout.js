import React from 'react';
import { Infinite, ItemContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import { getSize } from './sizeGetter';
import './Pad.css';

export default class ListContentLayout extends React.Component {
  state = {
    index: '0',
    size: getSize(),
    scrollToIndex: null,
  };

  handleInputChange = evt => {
    const node = evt.target;
    const value = parseInt(node.value, 10);

    if (isNaN(value)) {
      return;
    }

    this.setState({
      [node.name]: value,
    });
  };

  handleScroll = () => {
    let { index } = this.state;

    index = parseInt(index, 10);

    if (isNaN(index)) {
      return;
    }

    this.setState({
      scrollToIndex: { index, animated: true },
    });
  };

  render() {
    const { index, size, scrollToIndex } = this.state;
    const { width, height } = size;

    return (
      <div className="pad-main">
        <div className="pad-preview">
          <Infinite
            className="pad-padele"
            width={width}
            height={height}
            spacing={10}
            itemCount={40}
            estimatedItemHeight={100}
            scrollToIndex={scrollToIndex}
            renderItem={({ itemIndex }) => {
              return (
                <div
                  style={{
                    height: `${25 * (itemIndex + 1)}px`,
                    backgroundColor: '#ffffff',
                    fontSize: '18px',
                    color: '#4a4a4a',
                    textAlign: 'center',
                    lineHeight: `${25 * (itemIndex + 1)}px`,
                  }}
                >
                  {itemIndex}
                </div>
              );
            }}
          />
        </div>
        <div className="pad-optbar">
          <TextField
            name="index"
            defaultValue={index}
            placeholder="index"
            onChange={this.handleInputChange}
          />
          <div className="pad-btn" onClick={this.handleScroll}>
            scroll
          </div>
        </div>
      </div>
    );
  }
}
