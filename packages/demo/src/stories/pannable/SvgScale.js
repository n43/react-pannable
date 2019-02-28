import React from 'react';

const SvgScale = props => (
  <svg
    className="prefix__icon"
    viewBox="0 0 1024 1024"
    width={25}
    height={25}
    {...props}
  >
    <defs>
      <style />
    </defs>
    <path
      d="M106.84 67.56h266.27a27.78 27.78 0 1 0 0-55.56H39.78A27.88 27.88 0 0 0 12 39.78v333.33a27.78 27.78 0 1 0 55.56 0V106.84L409 448.31A27.77 27.77 0 1 0 448.31 409zM1012 650.89a27.78 27.78 0 1 0-55.56 0v266.27L615 575.69A27.77 27.77 0 0 0 575.69 615l341.47 341.44H650.89a27.78 27.78 0 1 0 0 55.56h333.33a27.88 27.88 0 0 0 27.78-27.78z"
      fill="#fffff1"
    />
  </svg>
);

export default SvgScale;
