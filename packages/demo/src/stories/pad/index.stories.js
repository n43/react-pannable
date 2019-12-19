import React, { useCallback, useMemo } from 'react';
import { AutoResizing, Pad, GeneralContent, GridContent } from 'react-pannable';
import {
  withKnobs,
  select,
  number,
  boolean,
  object,
  text,
} from '@storybook/addon-knobs';
import Plaid from './Plaid';
import DemoText from './DemoText';
import '../../ui/overview.css';
import './pad.css';
import svgCircle from './circle.svg';

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

  const scrollType = select(
    'Scroll Action',
    { null: '', scrollTo: 'scrollTo', scrollToRect: 'scrollToRect' },
    '',
    'Scrolling'
  );
  let point;
  let rect;
  let align;
  let animated;

  if (scrollType === 'scrollTo') {
    point = object('point', { x: 0, y: 0 }, 'Scrolling');
    animated = boolean('animated', true, 'Scrolling');
  } else if (scrollType === 'scrollToRect') {
    rect = object('rect', { x: 0, y: 0, width: 0, height: 0 }, 'Scrolling');
    align = select(
      'align',
      { center: 'center', start: 'start', end: 'end', auto: 'auto' },
      'center',
      'Scrolling'
    );
    animated = boolean('animated ', true, 'Scrolling');
  }

  const scrollTo = useMemo(() => {
    if (scrollType !== 'scrollTo') {
      return null;
    }

    return { point, animated };
  }, [scrollType, point, animated]);

  const scrollToRect = useMemo(() => {
    if (scrollType !== 'scrollToRect') {
      return null;
    }

    return { rect, align, animated };
  }, [scrollType, rect, align, animated]);

  const plaidRowCount = number("Plaid's rowCount", 20, {});
  const plaidColumnCount = number("Plaid's columnCount", 20, {});

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
              scrollToRect={scrollToRect}
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

export const LayoutWithGeneralContent = () => {
  const contentWidth = select(
    'width',
    {
      "equals To Pad's width": null,
      undefined: undefined,
      '1000': 1000,
    },
    null,
    'props'
  );
  const contentHeight = select(
    'height',
    { undefined: undefined, '1000': 1000 },
    undefined,
    'props'
  );
  const content = text('content', DemoText);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">GeneralContent</div>
      <div className="overview-desc">
        GeneralContent component is similar to ItemContent and automatically
        resizes when the data change.
      </div>
      <div className="overview-content">
        <AutoResizing height={500}>
          {({ width, height }) => (
            <Pad width={width} height={height} alwaysBounceX={false}>
              <GeneralContent
                width={contentWidth === null ? width : contentWidth}
                height={contentHeight}
                className="pad-content"
              >
                <div className="pad-intro">{content}</div>
              </GeneralContent>
            </Pad>
          )}
        </AutoResizing>
      </div>
    </div>
  );
};

export const LayoutWithGridContent = () => {
  const contentWidth = select(
    'width',
    {
      "equals To Pad's width": null,
      undefined: undefined,
      '1000': 1000,
    },
    null,
    'props'
  );
  const contentHeight = select(
    'height',
    {
      "equals To Pad's height": null,
      undefined: undefined,
      '1000': 1000,
    },
    null,
    'props'
  );
  const direction = select('direction', { y: 'y', x: 'x' }, 'y', 'props');
  const rowSpacing = number('rowSpacing', 0, {}, 'props');
  const columnSpacing = number('columnSpacing', 0, {}, 'props');
  const itemWidth = number('itemWidth', 100, {}, 'props');
  const itemHeight = number('itemHeight', 100, {}, 'props');
  const itemCount = number('itemCount', 100, {}, 'props');

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">GridContent</div>
      <div className="overview-desc">
        GridContent component displays data in grid layout. It provides the
        items that display the actual content.
      </div>
      <div className="overview-content">
        <AutoResizing height={500}>
          {({ width, height }) => (
            <Pad
              width={width}
              height={height}
              alwaysBounceX={false}
              alwaysBounceY={false}
            >
              <GridContent
                width={contentWidth === null ? width : contentWidth}
                height={contentHeight === null ? height : contentHeight}
                direction={direction}
                rowSpacing={rowSpacing}
                columnSpacing={columnSpacing}
                itemWidth={itemWidth}
                itemHeight={itemHeight}
                itemCount={itemCount}
                renderItem={({ itemIndex, Item }) => (
                  <Item>
                    <img src={svgCircle} className="pad-circle" />
                    <div className="pad-griditem">{itemIndex}</div>
                  </Item>
                )}
                className="pad-content"
              />
            </Pad>
          )}
        </AutoResizing>
      </div>
    </div>
  );
};
