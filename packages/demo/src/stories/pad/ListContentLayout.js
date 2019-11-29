import React from 'react';
import { Infinite, ItemContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import { getSize } from './sizeGetter';
import './Pad.css';

export default class ListContentLayout extends React.Component {
  state = {
    index: 0,
    size: getSize(),
    scrollTo: null,
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
    const { index } = this.state;

    this.setState({
      scrollTo: {
        point: { x: 0, y: index },
        animated: true,
      },
    });
  };

  render() {
    const { index, size, scrollTo } = this.state;
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
            scrollTo={scrollTo}
            renderItem={({ itemIndex }) => {
              return (
                <ItemContent
                  height={25 * (itemIndex + 1)}
                  style={{
                    backgroundColor: '#ffffff',
                    fontSize: '18px',
                    color: '#4a4a4a',
                    textAlign: 'center',
                    lineHeight: 25 * (itemIndex + 1) + 'px',
                  }}
                >
                  {itemIndex}
                </ItemContent>
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
