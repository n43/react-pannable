import React from 'react';
import './banner.css';

export default function Banner(props) {
  return (
    <div className="banner-wrapper">
      <div className="banner-content">{props.children}</div>
    </div>
  );
}
