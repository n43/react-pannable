import React from 'react';
import { Pad, ListContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import RadioField from '../../ui/field/RadioField';
import SvgPhone from './SvgPhone';
import './Pad.css';

export default class ListContentLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemWidth: 100,
      itemHeight: 100,
      scrollToIndex: 0,
      separator: '-',
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
  handleRadioChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
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
    const { itemWidth, itemHeight, separator, scrollToIndex } = this.state;
    const separatorOptions = [
      { title: '-', value: '-', checked: separator === '-' },
      { title: ',', value: ',', checked: separator === ',' },
    ];

    return (
      <React.Fragment>
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
                {pad => (
                  <ListContent
                    ref={this.listRef}
                    width={346}
                    spacing={10}
                    estimatedItemWidth={itemWidth}
                    estimatedItemHeight={itemHeight}
                    itemCount={20}
                    renderItem={({ itemIndex, Item, visibleRect }) => {
                      let backgroundColor =
                        itemIndex % 2 ? '#defdff' : '#cbf1ff';

                      const body = [];
                      for (let idx = 0; idx < itemIndex; idx++) {
                        body.push(<div key={idx}>{idx}</div>);
                      }

                      return (
                        <Item
                          hash={'' + itemIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor,
                            color: '#75d3ec',
                            whiteSpace: 'pre-line',
                            textAlign: 'center',
                          }}
                        >
                          {body}
                          <div>{JSON.stringify(visibleRect)}</div>
                        </Item>
                      );
                    }}
                    visibleRect={pad.getVisibleRect()}
                    onResize={size => pad.setContentSize(size)}
                  />
                )}
              </Pad>
            </div>
          </div>
          <div className="pad-optbar">
            <TextField
              name="itemWidth"
              defaultValue={itemWidth}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="itemHeight"
              defaultValue={itemHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <RadioField
              name="separator"
              options={separatorOptions}
              onChange={this.handleRadioChange}
            />
            <TextField
              name="scrollToIndex"
              defaultValue={scrollToIndex}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <div className="pad-btn" onClick={this.handleScrollToPos}>
              scroll
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
