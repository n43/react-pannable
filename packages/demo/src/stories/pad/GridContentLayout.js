import React from 'react';
import { Pad, GridContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import SvgPoster from './SvgPoster';
import { getSize } from './sizeGetter';
import './Pad.css';
import './GridContentLayout.css';

export default class GridContentLayout extends React.Component {
  state = {
    itemWidth: 187,
    itemHeight: 150,
    scrollToIndex: 0,
    size: getSize(),
  };
  padRef = React.createRef();
  gridRef = React.createRef();

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
    const rect = this.gridRef.current.getItemRect({
      itemIndex: scrollToIndex,
    });
    this.padRef.current.scrollToRect({ rect, animated: true });
  };
  render() {
    const { itemWidth, itemHeight, scrollToIndex, size } = this.state;
    const { width, height } = size;

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <Pad
              ref={this.padRef}
              width={width}
              height={height}
              directionalLockEnabled
              className="autoadjust-pad"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <GridContent
                ref={this.gridRef}
                width={width}
                itemWidth={itemWidth}
                itemHeight={itemHeight}
                itemCount={100}
                rowSpacing={10}
                renderItem={({ rowIndex, columnIndex }) => {
                  return (
                    <div className="grid">
                      <div className="griditem">
                        <div className="griditem-poster">
                          <SvgPoster />
                        </div>
                        <div className="griditem-text">
                          Grid {rowIndex}-{columnIndex}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </Pad>
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
