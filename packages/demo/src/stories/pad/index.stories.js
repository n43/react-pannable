import React, { useCallback, useMemo } from 'react';
import {
  AutoResizing,
  Pad,
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
  const disabled = boolean('disabled', false, 'props');
  const pagingEnabled = boolean('pagingEnabled', false, 'props');
  const directionalLockEnabled = boolean(
    'directionalLockEnabled',
    false,
    'props'
  );
  const boundX = select(
    'boundX',
    { bounce: 1, hard: 0, boundless: -1 },
    undefined,
    'props'
  );
  const boundY = select(
    'boundY',
    { bounce: 1, hard: 0, boundless: -1 },
    undefined,
    'props'
  );
  const contentInsetTop = number('contentInsetTop', 0, undefined, 'props');
  const contentInsetRight = number('contentInsetRight', 0, undefined, 'props');
  const contentInsetBottom = number(
    'contentInsetBottom',
    0,
    undefined,
    'props'
  );
  const contentInsetLeft = number('contentInsetLeft', 0, undefined, 'props');
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

  const onStartDragging = useCallback((evt) => {
    console.log('onStartDragging', evt);
  }, []);
  const onEndDragging = useCallback((evt) => {
    console.log('onEndDragging', evt);
  }, []);
  const onStartDecelerating = useCallback((evt) => {
    console.log('onStartDecelerating', evt);
  }, []);
  const onEndDecelerating = useCallback((evt) => {
    console.log('onEndDecelerating', evt);
  }, []);
  const onResizeContent = useCallback((evt) => {
    console.log('onResizeContent', evt);
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
        <AutoResizing
          width={padWidth}
          height={padHeight}
          render={({ width, height }) => (
            <Pad
              width={width}
              height={height}
              boundX={boundX}
              boundY={boundY}
              contentInsetTop={contentInsetTop}
              contentInsetRight={contentInsetRight}
              contentInsetBottom={contentInsetBottom}
              contentInsetLeft={contentInsetLeft}
              pagingEnabled={pagingEnabled}
              directionalLockEnabled={directionalLockEnabled}
              disabled={disabled}
              scrollTo={scrollTo}
              onStartDragging={onStartDragging}
              onEndDragging={onEndDragging}
              onStartDecelerating={onStartDecelerating}
              onEndDecelerating={onEndDecelerating}
              onResizeContent={onResizeContent}
            >
              <ItemContent autoResizing>
                <Plaid
                  rowCount={plaidRowCount}
                  columnCount={plaidColumnCount}
                />
              </ItemContent>
            </Pad>
          )}
        />
      </div>
    </div>
  );
};

export const LayoutWithAutoResizingContent = () => {
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
      <div className="overview-h1">AutoResizingContent</div>
      <div className="overview-desc">
        AutoResizingContent component is similar to ItemContent and
        automatically resizes when the data change.
      </div>
      <div className="overview-content">
        <AutoResizing
          height={500}
          render={({ width, height }) => (
            <Pad width={width} height={height} boundX={0}>
              <ItemContent
                autoResizing
                width={contentWidth === null ? width : contentWidth}
                height={contentHeight}
                className="pad-content"
              >
                <div className="pad-intro">{content}</div>
              </ItemContent>
            </Pad>
          )}
        />
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
        <AutoResizing
          height={500}
          render={({ width, height }) => (
            <Pad width={width} height={height} boundX={0} boundY={0}>
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
        />
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

  const onResizeContent = useCallback((evt) => {
    console.log('onResizeContent', evt);
  }, []);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">ListContent</div>
      <div className="overview-desc">
        ListContent component displays data in a single column/row. It provides
        the items that display the actual content.
      </div>
      <div className="overview-content">
        <AutoResizing
          height={500}
          render={({ width, height }) => {
            const listWidth = contentWidth === null ? width : contentWidth;
            const listHeight = contentHeight === null ? height : contentHeight;

            return (
              <Pad
                width={width}
                height={height}
                boundX={0}
                boundY={0}
                onResizeContent={onResizeContent}
              >
                <ListContent
                  width={listWidth}
                  height={listHeight}
                  direction={direction}
                  spacing={spacing}
                  estimatedItemWidth={estimatedItemWidth}
                  estimatedItemHeight={estimatedItemHeight}
                  itemCount={itemCount}
                  renderItem={({ itemIndex, Item }) => (
                    <Item hash={String(itemIndex)}>
                      {direction === 'x' ? (
                        <ItemContent height={listHeight}>
                          <div
                            style={{
                              height: '100%',
                              width: `${itemIndex + 3}em`,
                            }}
                            className="pad-listitem"
                          >
                            {itemIndex + 1} kg
                          </div>
                        </ItemContent>
                      ) : (
                        <ItemContent width={listWidth}>
                          <div
                            style={{
                              width: '100%',
                              height: `${itemIndex + 3}em`,
                            }}
                            className="pad-listitem"
                          >
                            {itemIndex + 1} kg
                          </div>
                        </ItemContent>
                      )}
                    </Item>
                  )}
                  className="pad-content"
                />
              </Pad>
            );
          }}
        />
      </div>
    </div>
  );
};

export const LayoutWithMultipleNestedContent = () => {
  const contentForIC = text("ItemContent's content", 'Try React');
  const contentForGEC = text(
    "AutoResizingContent's content",
    ' React has been designed from the start for gradual adoption, and you can use as little or as much React as you need. Whether you want to get a taste of React, add some interactivity to a simple HTML page, or start a complex React-powered app, the links in this section will help you get started.'
  );
  const itemCountForGC = number("GridContent's itemCount", 10, {});
  const itemCountForLC = number("ListContent's itemCount", 10, {});

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">Multiple Nested Content</div>
      <div className="overview-desc"></div>
      <div className="overview-content">
        <AutoResizing
          height={500}
          render={({ width, height }) => (
            <Pad width={width} height={height} boundX={0}>
              <ListContent
                width={width}
                height={height}
                direction="y"
                spacing={20}
                itemCount={4}
                renderItem={({ itemIndex, Item }) => {
                  if (itemIndex === 0) {
                    return (
                      <Item hash={`ItemContent_${contentForIC}`}>
                        <ItemContent>
                          <div className="pad-intro">{contentForIC}</div>
                        </ItemContent>
                      </Item>
                    );
                  }

                  if (itemIndex === 1) {
                    return (
                      <ItemContent autoResizing>
                        <div className="pad-intro">{contentForGEC}</div>
                      </ItemContent>
                    );
                  }

                  if (itemIndex === 2) {
                    return (
                      <GridContent
                        width={width}
                        direction="y"
                        itemWidth={100}
                        itemHeight={100}
                        itemCount={itemCountForGC}
                        renderItem={({ itemIndex }) => (
                          <>
                            <img src={svgCircle} className="pad-circle" />
                            <div className="pad-griditem">{itemIndex}</div>
                          </>
                        )}
                      />
                    );
                  }

                  if (itemIndex === 3) {
                    return (
                      <ListContent
                        direction="y"
                        itemCount={itemCountForLC}
                        renderItem={({ itemIndex }) => (
                          <ItemContent>
                            <div
                              style={{
                                width: '100%',
                                height: `${itemIndex + 3}em`,
                              }}
                              className="pad-listitem"
                            >
                              {itemIndex + 1} kg
                            </div>
                          </ItemContent>
                        )}
                      />
                    );
                  }

                  return null;
                }}
                className="pad-content"
              />
            </Pad>
          )}
        />
      </div>
    </div>
  );
};
