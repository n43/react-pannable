import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from './TextField';
import './Pad.css';
import './FillingParentSpace.css';

class FillingParentSpace extends Component {
  state = {
    width: -1,
    height: -1,
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

  renderContent = () => {
    return (
      <div className="fillparent-padcontent">
        If you don't specify both width and height, Pad will automatically
        expand to fill its parent.
      </div>
    );
  };

  render() {
    const { width, height } = this.state;

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
                width={width}
                height={height}
              >
                {this.renderContent()}
              </Pad>
            </div>
          </div>
          <div className="pad-optbar">
            <TextField
              name="width"
              defaultValue={'' + width}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="height"
              defaultValue={'' + height}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default FillingParentSpace;
