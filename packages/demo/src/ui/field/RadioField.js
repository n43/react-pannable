import React, { Component } from 'react';
import './field.css';

class RadioField extends Component {
  render() {
    const { name, options, onChange } = this.props;

    return (
      <div className="radiofield-item">
        <div className="radiofield-label">{name}</div>
        {options.map(({ title, value, checked }) => (
          <label className="radiofield-radio" key={value}>
            <input
              type="radio"
              name={name}
              value={value}
              checked={checked}
              onChange={onChange}
            />{' '}
            {title}
          </label>
        ))}
      </div>
    );
  }
}
export default RadioField;
