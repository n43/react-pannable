import React from 'react';
import { Pad, ListContent, ItemContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import { getSize } from './sizeGetter';
import './Pad.css';

export default class ListContentLayout extends React.Component {
  state = {
    spacing: 8,
    size: getSize(),
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

  render() {
    const { spacing, size } = this.state;
    const { width, height } = size;

    return (
      <div className="pad-main">
        <div className="pad-preview">
          <Pad
            className="pad-padele"
            width={width}
            height={height}
            directionalLockEnabled
          >
            <ListContent
              width={width}
              spacing={spacing}
              itemCount={40}
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
          </Pad>
        </div>
        <div className="pad-optbar">
          <TextField
            name="spacing"
            defaultValue={spacing}
            placeholder="integer"
            onChange={this.handleInputChange}
          />
        </div>
      </div>
    );
  }
}
