import React, { useRef } from 'react';
import Pad from '../pad/Pad';
import InfiniteInner from './InfiniteInner';
import ListContent from '../pad/ListContent';

const defaultInfiniteProps = {
  direction: 'y',
  spacing: 0,
  itemCount: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
  renderItem: () => null,
  renderHeader: () => null,
  renderFooter: () => null,
  scrollToIndex: null,
  ...Pad.defaultProps,
  directionalLockEnabled: true,
};

function Infinite(props) {
  const {
    direction,
    spacing,
    itemCount,
    estimatedItemWidth,
    estimatedItemHeight,
    renderItem,
    renderHeader,
    renderFooter,
    scrollToIndex,
    children,
    ...padProps
  } = props;
  const { width, height, renderOverlay } = padProps;
  const listRef = useRef({});

  padProps.renderOverlay = (pad, methods) => (
    <>
      <InfiniteInner
        pad={pad}
        scrollToIndex={scrollToIndex}
        listRef={listRef}
        onAdjust={methods._scrollTo}
        children={children}
      />
      {renderOverlay(pad, methods)}
    </>
  );

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  return (
    <Pad {...padProps}>
      <ListContent
        width={width}
        height={height}
        direction={direction}
        itemCount={3}
        renderItem={attrs => {
          const { itemIndex, Item } = attrs;

          if (itemIndex === 0) {
            return renderHeader(attrs);
          }
          if (itemIndex === 2) {
            return renderFooter(attrs);
          }

          return (
            <Item forceRender>
              <ListContent
                width={width}
                height={height}
                direction={direction}
                spacing={spacing}
                itemCount={itemCount}
                estimatedItemWidth={estimatedItemWidth}
                estimatedItemHeight={estimatedItemHeight}
                renderItem={renderItem}
              >
                {layout => {
                  listRef.current.body = layout;
                }}
              </ListContent>
            </Item>
          );
        }}
      >
        {layout => {
          listRef.current.box = layout;
        }}
      </ListContent>
    </Pad>
  );
}

Infinite.defaultProps = defaultInfiniteProps;
export default Infinite;
