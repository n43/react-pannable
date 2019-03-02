import React, { Component } from 'react';
import './TextField.css';

class TextField extends Component {
  render() {
    const { name, readOnly } = this.props;

    return (
      <div className="textfield-item">
        <div className="textfield-label">{name}</div>
        {readOnly ? (
          <div className="textfield-input">{value}</div>
        ) : (
          <input {...this.props} className="textfield-input" />
        )}
      </div>
    );
  }
}
export default TextField;
