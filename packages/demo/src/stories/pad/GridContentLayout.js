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
              <Pad
                className="autoadjust-pad"
                directionalLockEnabled
                width={346}
                height={552}
              >
                {pad => {
                  const cOffset = pad.getContentOffset();
                  const size = pad.getSize();

                  return (
                    <GridContent
                      ref={ref => {
                        pad.gridContent = ref;
                      }}
                      width={346}
                      itemWidth={100}
                      itemHeight={100}
                      itemCount={100}
                      renderItem={({ rowIndex, columnIndex }) => (
                        <div>{rowIndex + '-' + columnIndex}</div>
                      )}
                      visibleRect={{
                        x: -cOffset.x,
                        y: -cOffset.y,
                        width: size.width,
                        height: size.height,
                      }}
                      onResize={size => pad.setContentSize(size)}
                    />
                  );
                }}
              </Pad>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
