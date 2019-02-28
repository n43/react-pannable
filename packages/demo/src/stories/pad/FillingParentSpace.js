import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import './FillingParentSpace.css';
import { hidden } from 'ansi-colors';

class FillingParentSpace extends Component {
  state = {
    width: 400,
    height: 400,
    parentSize: '600*600',
  };

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  renderOptItem(name, value, placeholder, isReadonly) {
    return (
      <div className="fillingp-optitem">
        <div className="fillingp-optlabel">{name}</div>
        {isReadonly ? (
          <div className="fillingp-optinput">{value}</div>
        ) : (
          <input
            className="fillingp-optinput"
            value={value}
            name={name}
            placeholder={placeholder}
            onChange={this.handleInputChange}
          />
        )}
      </div>
    );
  }

  renderContent = () => {
    return (
      <div className="fillingp-content">
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
        <div className="fillingp-optbar">
          {this.renderOptItem('width', width, 'integer', false)}
          {this.renderOptItem('height', height, 'integer', false)}
          {this.renderOptItem('parentSize', parentSize, '', true)}
        </div>
        <div className="fillingp-main">
          <Pad
            className="fillingp-pad"
            contentWidth={340}
            contentHeight={100}
            {...padProps}
          >
            {this.renderContent()}
          </Pad>
        </div>
      </React.Fragment>
    );
  }
}

export default FillingParentSpace;
