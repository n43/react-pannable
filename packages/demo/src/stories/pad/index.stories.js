import React, { useCallback } from 'react';
import { AutoResizing, Pad } from 'react-pannable';
import {
  withKnobs,
  select,
  number,
  boolean,
  object,
} from '@storybook/addon-knobs';
import Plaid from './Plaid';
import '../../ui/overview.css';
import './padc.css';

export default {
  title: 'Pad',
  decorators: [withKnobs],
};

export const Overview = () => {
  const padWidth = select(
    'width',
    { 'from AutoResizing': undefined, '400': 400 },
    undefined,
    'props'
  );
  const padHeight = select(
    'height',
    { '600': 600, '1000': 1000 },
    600,
    'props'
  );
  const enabled = boolean('enabled', true, 'props');
  const pagingEnabled = boolean('pagingEnabled', false, 'props');
  const directionalLockEnabled = boolean(
    'directionalLockEnabled',
    false,
    'props'
  );
  const alwaysBounceX = boolean('alwaysBounceX', true, 'props');
  const alwaysBounceY = boolean('alwaysBounceY', true, 'props');
  const scrollTo = object(
    'scrollTo',
    {
      point: { x: 0, y: 0 },
      animated: false,
    },
    'props'
  );

  const plaidRowCount = number("Plaid's rowCount", 20, {
    range: true,
    min: 1,
    max: 50,
    step: 1,
  });
  const plaidColumnCount = number("Plaid's columnCount", 20, {
    range: true,
    min: 1,
    max: 50,
    step: 1,
  });

  const onDragStart = useCallback(evt => {
    console.log('onDragStart', evt);
  }, []);
  const onDragEnd = useCallback(evt => {
    console.log('onDragEnd', evt);
  }, []);
  const onDecelerationStart = useCallback(evt => {
    console.log('onDecelerationStart', evt);
  }, []);
  const onDecelerationEnd = useCallback(evt => {
    console.log('onDecelerationEnd', evt);
  }, []);
  const onContentResize = useCallback(evt => {
    console.log('onContentResize', evt);
  }, []);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">Pad</div>
      <div className="overview-desc">
        Pad component handles scrolling of content. its origin is adjustable
        over the content. it tracks the movements of the touch/mouse and adjusts
        the origin accordingly. by default, it bounces back when scrolling
        exceeds the bounds of the content.
      </div>
      <div className="overview-content">
        <AutoResizing width={padWidth} height={padHeight}>
          {({ width, height }) => (
            <Pad
              width={width}
              height={height}
              pagingEnabled={pagingEnabled}
              directionalLockEnabled={directionalLockEnabled}
              alwaysBounceX={alwaysBounceX}
              alwaysBounceY={alwaysBounceY}
              enabled={enabled}
              scrollTo={scrollTo}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDecelerationStart={onDecelerationStart}
              onDecelerationEnd={onDecelerationEnd}
              onContentResize={onContentResize}
            >
              <Plaid rowCount={plaidRowCount} columnCount={plaidColumnCount} />
            </Pad>
          )}
        </AutoResizing>
      </div>
    </div>
  );
};
