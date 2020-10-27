import React from 'react';

const SvgNote = props => (
  <svg viewBox="0 0 300 300" {...props}>
    <path fill="#ffe98f" d="M50 30v-30H50V85h100V0H0v300h150V10z" />

    <path
      fill="#ffe98f"
      d="M150 0v85v30H150v30v30H150v125l100-90 50 39.999V0z"
    />
    <path fill="#ffda44" d="M150 300l150-50.001L250 210z" />
  </svg>
);

export default SvgNote;
