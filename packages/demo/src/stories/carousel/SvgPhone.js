import React from 'react';

const SvgPhone = props => (
  <svg
    className="prefix__icon"
    viewBox="0 0 800 1300"
    width={400}
    height={650}
    {...props}
  >
    <rect
      x="0"
      y="0"
      rx="60"
      ry="60"
      width="800"
      height="1300"
      fill="#cdcdcd"
    />
    <rect x="55" y="55" width="690" height="1100" fill="#ffffff" />
    <circle cx="400" cy="1230" r="50" fill="#f5f5f5" />
  </svg>
);

export default SvgPhone;
