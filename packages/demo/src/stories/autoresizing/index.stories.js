import React, { useCallback } from 'react';
import { withKnobs, select, object } from '@storybook/addon-knobs';
import { AutoResizing } from 'react-pannable';
import '../../ui/overview.css';
import './ar.css';

export default {
  title: 'AutoResizing',
  decorators: [withKnobs],
};

export const Overview = () => {
  const arWidth = select(
    'width',
    { undefined: undefined, '400': 400, '600': 600 },
    undefined,
    'props'
  );
  const arHeight = select(
    'height',
    { undefined: undefined, '400': 400, '600': 600 },
    undefined,
    'props'
  );
  const wrapperStyle = object('Wrapper Style', { paddingTop: 20 });

  const onResize = useCallback(size => {
    console.log('onResize', size);
  }, []);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">AutoResizing</div>
      <div className="overview-desc">
        AutoResizing component calculates the size of the component
        automatically when its parent node's size changes.
      </div>
      <div style={wrapperStyle} className="overview-content ar-wrapper">
        <AutoResizing width={arWidth} height={arHeight} onResize={onResize}>
          {({ width, height }) => (
            <div style={{ width, height }} className="ar-box">
              <div className="ar-title">
                width: {width} ; height: {height} ;
              </div>
            </div>
          )}
        </AutoResizing>
      </div>
    </div>
  );
};
