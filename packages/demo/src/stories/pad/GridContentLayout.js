import React from 'react';
import { Pad, GridContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import SvgPhone from './SvgPhone';
import './Pad.css';

export default class GridContentLayout extends React.Component {
  state = {
    itemWidth: 100,
    itemHeight: 100,
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
    const { itemWidth, itemHeight } = this.state;

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <Pad
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
                      ref={ref => {
                        pad.gridContent = ref;
                      }}
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
                              height: '100%',
                              backgroundColor,
                              color: '#75d3ec',
                            }}
                          >
                            {rowIndex + '-' + columnIndex}
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
          </div>
        </div>
      </React.Fragment>
    );
  }
}
