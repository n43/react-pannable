import { InfiniteScrollTo } from './infiniteReducer';
import InfiniteInner from './InfiniteInner';
import { XY, Rect } from '../interfaces';
import Pad, { defaultPadProps, PadProps } from '../pad/Pad';
import ListContent, {
  ListLayoutAttrs,
  ListLayoutResult,
} from '../pad/ListContent';
import React, { useRef, useCallback } from 'react';

type InfiniteLayout = {
  box?: ListLayoutResult;
  body?: ListLayoutResult;
};

export interface InfiniteProps extends PadProps {
  direction: XY;
  itemCount: number;
  renderItem: (attrs: ListLayoutAttrs) => React.ReactNode;
  spacing?: number;
  estimatedItemWidth?: 0;
  estimatedItemHeight?: 0;
  renderHeader?: (attrs: ListLayoutAttrs) => React.ReactNode;
  renderFooter?: (attrs: ListLayoutAttrs) => React.ReactNode;
  scrollToIndex: InfiniteScrollTo | null;
}

const defaultInfiniteProps: InfiniteProps = {
  direction: 'y',
  spacing: 0,
  itemCount: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
  renderItem: () => null,
  renderHeader: () => null,
  renderFooter: () => null,
  scrollToIndex: null,
  ...defaultPadProps,
  directionalLockEnabled: true,
};

const Infinite: React.FC<
  InfiniteProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>
> = React.memo((props) => {
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
  } = props as Required<InfiniteProps> &
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>;
  const { width, height, renderOverlay } = padProps;
  const listRef = useRef<InfiniteLayout>({});

  const calculateRectForIndex = useCallback((index: number): Rect => {
    const { box, body } = listRef.current;
    let rect: Rect = { x: 0, y: 0, width: 0, height: 0 };

    if (box) {
      rect = box.layoutList[1].rect;
    }
    if (body) {
      index = Math.max(0, Math.min(index, body.layoutList.length - 1));
      const attrs = body.layoutList[index];

      rect = {
        x: rect.x + attrs.rect.x,
        y: rect.y + attrs.rect.y,
        width: attrs.rect.width,
        height: attrs.rect.height,
      };
    }

    return rect;
  }, []);

  padProps.renderOverlay = (pad, methods) => (
    <>
      <InfiniteInner
        pad={pad}
        scrollToIndex={scrollToIndex}
        calculateRectForIndex={calculateRectForIndex}
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
        renderItem={(attrs) => {
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
                {(layout: ListLayoutResult) => {
                  listRef.current.body = layout;
                }}
              </ListContent>
            </Item>
          );
        }}
      >
        {(layout: ListLayoutResult) => {
          listRef.current.box = layout;
        }}
      </ListContent>
    </Pad>
  );
});

Infinite.defaultProps = defaultInfiniteProps;
export default Infinite;
