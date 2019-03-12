import React from 'react';
import { Pad, GridContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import RadioField from '../../ui/field/RadioField';
import SvgPhone from './SvgPhone';
import './Pad.css';

export default class GridContentLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemWidth: 100,
      itemHeight: 100,
      scrollToIndex: 0,
      separator: '-',
    };
    this.padRef = React.createRef();
    this.gridRef = React.createRef();
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
    const rect = this.gridRef.current.getItemRect({
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
              >
                {pad => {
                  const cOffset = pad.getContentOffset();
                  const size = pad.getSize();

                  return (
                    <GridContent
                      ref={this.gridRef}
                      width={346}
                      itemWidth={itemWidth}
                      itemHeight={itemHeight}
                      itemCount={100}
                      renderItem={({ itemIndex, rowIndex, columnIndex }) => {
                        let backgroundColor =
                          itemIndex % 2 ? '#defdff' : '#cbf1ff';

                        return (
                          <div
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
                            index:{itemIndex + '\n'}
                            {'r:' + rowIndex + separator + 'c:' + columnIndex}
                          </div>
                        );
                      }}
                      visibleRect={{
                        x: -cOffset.x,
                        y: -cOffset.y,
                        width: size.width,
                        height: size.height,
                      }}
                      onResize={size => pad.setContentSize(size)}
                    />
                  );
                }}
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
