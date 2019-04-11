import React from 'react';
import { Pad, ListContent, ItemContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import SvgPhone from './SvgPhone';
import './Pad.css';

export default class ListContentLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      spacing: 10,
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
          <SvgPhone className="pad-preview-bg" />
          <div className="pad-preview-content">
            <Pad
              ref={this.padRef}
              className="autoadjust-pad"
              directionalLockEnabled
              width={346}
              height={552}
              alwaysBounceX={false}
            >
              <ListContent
                ref={this.listRef}
                width={346}
                spacing={spacing}
                itemCount={3}
                renderItem={({ itemIndex, Item }) => {
                  if (itemIndex === 0) {
                    return (
                      <Item hash="Title" style={{ backgroundColor: '#defdff' }}>
                        Header
                      </Item>
                    );
                  } else if (itemIndex === 1) {
                    return (
                      <ListContent
                        spacing={spacing}
                        itemCount={10}
                        renderItem={({ itemIndex: index }) => {
                          return (
                            <ItemContent
                              height={20 * (index + 1)}
                              style={{ backgroundColor: '#cbf1ff' }}
                            >
                              {index}
                            </ItemContent>
                          );
                        }}
                      />
                    );
                  } else if (itemIndex === 2) {
                    return (
                      <Item hash="Title" style={{ backgroundColor: '#defdff' }}>
                        Footer
                      </Item>
                    );
                  }
                }}
              />
            </Pad>
          </div>
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
