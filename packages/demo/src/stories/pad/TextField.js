import React, { Component } from 'react';
import './TextField.css';

class TextField extends Component {
  render() {
    const { name, value, placeholder, isReadonly, onChange } = this.props;

    return (
      <div className="textfield-item">
        <div className="textfield-label">{name}</div>
        {isReadonly ? (
          <div className="textfield-input">{value}</div>
        ) : (
          <input
            className="textfield-input"
            value={value}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
          />
        )}
      </div>
    );
  }
}
export default TextField;
