import React from 'react';
import { Pad, GridContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import SvgPhone from './SvgPhone';
import SvgPoster from './SvgPoster';
import './Pad.css';
import './GridContentLayout.css';

export default class GridContentLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemWidth: 173,
      itemHeight: 170,
      scrollToIndex: 0,
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
  handleScrollToPos = () => {
    const { scrollToIndex } = this.state;
    const rect = this.gridRef.current.getItemRect({
      itemIndex: scrollToIndex,
    });
    this.padRef.current.scrollToRect({ rect, animated: true });
  };
  render() {
    const { itemWidth, itemHeight, separator, scrollToIndex } = this.state;

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
                style={{ backgroundColor: '#f5f5f5' }}
              >
                <GridContent
                  ref={this.gridRef}
                  width={346}
                  itemWidth={itemWidth}
                  itemHeight={itemHeight}
                  itemCount={100}
                  columnSpacing={0}
                  renderItem={({ rowIndex, columnIndex }) => {
                    return (
                      <div className="grid">
                        <div className="item">
                          <div className="item-poster">
                            <SvgPoster />
                          </div>
                          <div className="item-text">
                            Grid {rowIndex}-{columnIndex}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
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
