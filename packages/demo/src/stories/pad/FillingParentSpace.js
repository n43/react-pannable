import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from './TextField';
import './Pad.css';
import './FillingParentSpace.css';

class FillingParentSpace extends Component {
  state = {
    width: 345,
    height: '',
    parentSize: '345*552',
  };

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  renderContent = () => {
    return (
      <div className="fillparent-padcontent">
        If you don't specify both width and height, Pad will automatically
        expand to fill its parent.
      </div>
    );
  };

  render() {
    const { width, height, parentSize } = this.state;

    const padProps = {};
    if (width && !isNaN(parseInt(width))) {
      padProps.width = parseInt(width);
    }
    if (height && !isNaN(parseInt(height))) {
      padProps.height = parseInt(height);
    }

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <Pad
                className="fillparent-padwrapper"
                contentWidth={345}
                contentHeight={100}
                {...padProps}
              >
                {this.renderContent()}
              </Pad>
            </div>
          </div>
          <div className="pad-optbar">
            <TextField
              name="width"
              value={width}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="height"
              value={height}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="parentSize"
              value={parentSize}
              isReadOnly={true}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default FillingParentSpace;
