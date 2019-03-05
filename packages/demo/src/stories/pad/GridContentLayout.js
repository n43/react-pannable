import React from 'react';
import { Pad, GridContent } from 'react-pannable';
import SvgPhone from './SvgPhone';
import './Pad.css';

export default class GridContentLayout extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <Pad className="autoadjust-pad" width={346} height={552}>
                {pad => (
                  <GridContent
                    pad={pad}
                    columnWidth={300}
                    rowHeight={300}
                    columnCount={10}
                    rowCount={10}
                    renderCell={({ rowIndex, columnIndex }) => (
                      <div>{rowIndex + '-' + columnIndex}</div>
                    )}
                  />
                )}
              </Pad>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
