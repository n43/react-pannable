import React from 'react';
import './plaid.css';

export default function Plaid(props) {
  const { rowCount = 0, columnCount = 0 } = props;
  const rows = [];

  for (let ridx = 0; ridx < rowCount; ridx++) {
    const columns = [];

    for (let cidx = 0; cidx < columnCount; cidx++) {
      const backgroundColor = (ridx + cidx) % 2 ? '#defdff' : '#cbf1ff';

      columns.push(
        <div key={cidx} className="plaid-data" style={{ backgroundColor }}>
          {ridx} - {cidx}
        </div>
      );
    }

    rows.push(
      <div key={ridx} className="plaid-row">
        {columns}
      </div>
    );
  }

  return <div className="plaid-box">{rows}</div>;
}
