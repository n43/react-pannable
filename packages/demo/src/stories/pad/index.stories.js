import React, { useCallback, useMemo } from 'react';
import {
  AutoResizing,
  Pad,
  GeneralContent,
  GridContent,
  ListContent,
  ItemContent,
} from 'react-pannable';
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
    { null: '', scrollTo: 'scrollTo' },
    '',
    'Scrolling'
  );

  let point;
  let rect;
  let align;
  let animated;

  if (scrollType === 'scrollTo') {
    point = object('point', undefined, 'Scrolling');
    rect = object('rect', undefined, 'Scrolling');
    align = select(
      'align',
      { auto: 'auto', center: 'center', end: 'end', start: 'start' },
      'start',
      'Scrolling'
    );
    animated = boolean('animated ', true, 'Scrolling');
  }

  const scrollTo = useMemo(() => {
    if (scrollType !== 'scrollTo') {
      return null;
    }

    return { point, rect, align, animated };
  }, [scrollType, point, rect, align, animated]);

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

export const LayoutWithListContent = () => {
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
  const spacing = number('spacing', 0, {}, 'props');
  const estimatedItemWidth = number('estimatedItemWidth', 100, {}, 'props');
  const estimatedItemHeight = number('estimatedItemHeight', 100, {}, 'props');
  const itemCount = number('itemCount', 100, {}, 'props');

  const onContentResize = useCallback(evt => {
    console.log('onContentResize', evt);
  }, []);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">ListContent</div>
      <div className="overview-desc">
        ListContent component displays data in a single column/row. It provides
        the items that display the actual content.
      </div>
      <div className="overview-content">
        <AutoResizing height={500}>
          {({ width, height }) => (
            <Pad
              width={width}
              height={height}
              alwaysBounceX={false}
              alwaysBounceY={false}
              onContentResize={onContentResize}
            >
              <ListContent
                width={contentWidth === null ? width : contentWidth}
                height={contentHeight === null ? height : contentHeight}
                direction={direction}
                spacing={spacing}
                estimatedItemWidth={estimatedItemWidth}
                estimatedItemHeight={estimatedItemHeight}
                itemCount={itemCount}
                renderItem={({ itemIndex, Item }) => {
                  const [width, height] =
                    direction === 'x'
                      ? ['height', 'width']
                      : ['width', 'height'];

                  return (
                    <Item hash={String(itemIndex)}>
                      <div
                        style={{
                          [width]: '100%',
                          [height]: `${itemIndex + 3}em`,
                        }}
                        className="pad-listitem"
                      >
                        {itemIndex + 1} kg
                      </div>
                    </Item>
                  );
                }}
                className="pad-content"
              />
            </Pad>
          )}
        </AutoResizing>
      </div>
    </div>
  );
};

export const LayoutWithMultipleNestedContent = () => {
  const heightForIC = number("ItemContent's height", 68, {});
  const contentForGEC = text(
    "GeneralContent's content",
    ' React has been designed from the start for gradual adoption, and you can use as little or as much React as you need. Whether you want to get a taste of React, add some interactivity to a simple HTML page, or start a complex React-powered app, the links in this section will help you get started.'
  );
  const itemCountForGC = number("GridContent's itemCount", 10, {});
  const itemCountForLC = number("ListContent's itemCount", 10, {});

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">Multiple Nested Content</div>
      <div className="overview-desc"></div>
      <div className="overview-content">
        <AutoResizing height={500}>
          {({ width, height }) => (
            <Pad width={width} height={height} alwaysBounceX={false}>
              <ListContent
                width={width}
                height={height}
                direction="y"
                spacing={20}
                itemCount={4}
                renderItem={({ itemIndex, Item }) => {
                  if (itemIndex === 0) {
                    return (
                      <Item hash="ItemContent">
                        <ItemContent height={heightForIC}>
                          <div className="pad-intro">Try React</div>
                        </ItemContent>
                      </Item>
                    );
                  }

                  if (itemIndex === 1) {
                    return (
                      <Item hash="GeneralContent">
                        <GeneralContent>
                          <div className="pad-intro">{contentForGEC}</div>
                        </GeneralContent>
                      </Item>
                    );
                  }

                  if (itemIndex === 2) {
                    return (
                      <Item hash="GridContent">
                        <GridContent
                          direction="y"
                          itemWidth={100}
                          itemHeight={100}
                          itemCount={itemCountForGC}
                          renderItem={({ itemIndex, Item }) => (
                            <Item>
                              <img src={svgCircle} className="pad-circle" />
                              <div className="pad-griditem">{itemIndex}</div>
                            </Item>
                          )}
                        />
                      </Item>
                    );
                  }

                  if (itemIndex === 3) {
                    return (
                      <Item hash="ListContent">
                        <ListContent
                          direction="y"
                          itemCount={itemCountForLC}
                          renderItem={({ itemIndex, Item }) => (
                            <Item hash={String(itemIndex)}>
                              <div
                                style={{
                                  width: '100%',
                                  height: `${itemIndex + 3}em`,
                                }}
                                className="pad-listitem"
                              >
                                {itemIndex + 1} kg
                              </div>
                            </Item>
                          )}
                        />
                      </Item>
                    );
                  }

                  return null;
                }}
                className="pad-content"
              />
            </Pad>
          )}
        </AutoResizing>
      </div>
    </div>
  );
};
