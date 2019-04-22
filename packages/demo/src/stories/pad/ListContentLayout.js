import React from 'react';
import { Pad, ListContent, ItemContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import './Pad.css';

export default class ListContentLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      spacing: 8,
      scrollToIndex: 0,
    };

    this.padRef = React.createRef();
    this.listRef = React.createRef();
  }

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

  handleScrollToPos = () => {
    const { scrollToIndex } = this.state;
    const rect = this.listRef.current.getItemRect({
      itemIndex: scrollToIndex,
    });
    this.padRef.current.scrollToRect({ rect, animated: true });
  };

  render() {
    const { spacing, scrollToIndex } = this.state;

    return (
      <div className="pad-main">
        <div className="pad-preview">
          <Pad
            ref={this.padRef}
            className="pad-padele"
            directionalLockEnabled
            width={375}
            height={650}
            alwaysBounceX={false}
          >
            <ListContent
              ref={this.listRef}
              width={375}
              spacing={spacing}
              itemCount={10}
              renderItem={({ itemIndex }) => {
                return (
                  <ItemContent
                    height={25 * (itemIndex + 1)}
                    style={{
                      backgroundColor: '#ffffff',
                      fontSize: '18px',
                      color: '#4a4a4a',
                      textAlign: 'center',
                      lineHeight: 28 * (itemIndex + 1) + 'px',
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
          <TextField
            name="scrollToIndex"
            defaultValue={scrollToIndex}
            placeholder="integer"
            onChange={this.handleInputChange}
          />
          <div className="pad-btn" onClick={this.handleScrollToPos}>
            Scroll
          </div>
        </div>
      </div>
    );
  }
}
