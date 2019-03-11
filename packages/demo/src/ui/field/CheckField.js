import React, { Component } from 'react';
import './field.css';

class CheckField extends Component {
  render() {
    const { name } = this.props;

    return (
      <div className="checkfield-item">
        <label>
          <input {...this.props} type="checkbox" /> {name}
        </label>
      </div>
    );
  }
}
export default CheckField;
