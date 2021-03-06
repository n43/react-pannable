import React from 'react';
import './infocard.css';

export default function Infocard(props) {
  const { info } = props;
  const { title, linesOfDesc = 3 } = info;
  const lines = [];

  for (let idx = 0; idx < linesOfDesc - 1; idx++) {
    lines.push(<div key={idx} className="infocard-line"></div>);
  }

  return (
    <div className="infocard-wrapper">
      <div className="infocard-title">{title}</div>
      {lines}
      <div className="infocard-line infocard-line-half"></div>
    </div>
  );
}
