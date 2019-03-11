import React, { Component } from 'react';
import { Pad, AutoResizing } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from '../../ui/field/TextField';
import './Pad.css';
import './AutoResizingPad.css';

class AutoResizingPad extends Component {
  state = {
    headerHeight: 50,
    padWidth: -1,
    padHeight: -1,
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
    const { headerHeight, padWidth, padHeight } = this.state;

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <div className="autoresize-wrapper">
                <div
                  className="autoresize-header"
                  style={{ height: headerHeight }}
                >
                  Header
                </div>
                <div className="autoresize-main">
                  <AutoResizing width={padWidth} height={padHeight}>
                    {({ width, height }) => (
                      <Pad
                        className="autoadjust-pad"
                        width={width}
                        height={height}
                        contentWidth={346}
                        contentHeight={100}
                        style={{ backgroundColor: '#f5f5f5' }}
                      >
                        <div className="autoresize-content">
                          AutoResizing would automatically fill its parent,
                          unless you specify the value of width or height
                        </div>
                      </Pad>
                    )}
                  </AutoResizing>
                </div>
              </div>
            </div>
          </div>
          <div className="pad-optbar">
            <TextField
              name="headerHeight"
              defaultValue={headerHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="padWidth"
              defaultValue={padWidth}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="padHeight"
              defaultValue={padHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AutoResizingPad;
