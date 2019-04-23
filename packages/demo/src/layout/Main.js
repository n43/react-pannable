import React from 'react';
import './Main.css';

export default function(props) {
  const { sourceLink } = props;

  return (
    <React.Fragment>
      <a href={sourceLink} target="_blank" className="main-source">
        View Source Code
      </a>
      <div className="main-wrapper">{props.children}</div>
    </React.Fragment>
  );
}
