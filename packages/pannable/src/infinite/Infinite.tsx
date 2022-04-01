import {
  InfiniteScrollTo,
  InfiniteState,
  InfiniteLayout,
  InfiniteMethods,
} from './infiniteReducer';
import InfiniteInner from './InfiniteInner';
import ListContent, { ListLayoutAttrs } from '../pad/ListContent';
import Pad from '../pad/Pad';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useRef } from 'react';

export interface InfiniteProps {
  itemCount: number;
  renderItem: (attrs: ListLayoutAttrs) => React.ReactNode;
  direction?: XY;
  spacing?: number;
  estimatedItemWidth?: number | ((itemIndex: number) => number);
  estimatedItemHeight?: number | ((itemIndex: number) => number);
  renderHeader?: (attrs: ListLayoutAttrs) => React.ReactNode;
  renderFooter?: (attrs: ListLayoutAttrs) => React.ReactNode;
  scrollToIndex?: InfiniteScrollTo | null;
  render?: (state: InfiniteState, methods: InfiniteMethods) => React.ReactNode;
}

export const Infinite = React.memo<
  Omit<React.ComponentProps<typeof Pad>, 'render'> & InfiniteProps
>((props) => {
  const {
    itemCount,
    renderItem,
    direction = 'y',
    spacing = 0,
    estimatedItemWidth = 0,
    estimatedItemHeight = 0,
    renderHeader,
    renderFooter,
    scrollToIndex,
    render,
    children,
    ...padProps
  } = props;
  const {
    width,
    height,
    renderOverlay,
    directionalLockEnabled = true,
  } = padProps;
  const layoutRef = useRef<InfiniteLayout>({});
  const methodsRef = useRef<InfiniteMethods>();

  useIsomorphicLayoutEffect(() => {
    if (scrollToIndex) {
      const methods = methodsRef.current;

      if (methods) {
        methods.scrollToIndex(scrollToIndex);
      }
    }
  }, [scrollToIndex]);

  padProps.directionalLockEnabled = directionalLockEnabled;

  if (direction === 'x') {
    padProps.boundY = padProps.boundY ?? 0;
  } else {
    padProps.boundX = padProps.boundX ?? 0;
  }

  padProps.renderOverlay = (pad, methods) => (
    <>
      <InfiniteInner
        direction={direction}
        pad={pad}
        padMethods={methods}
        layout={layoutRef.current}
        render={(state, methods) => {
          methodsRef.current = methods;

          return render ? render(state, methods) : children;
        }}
      />
      {renderOverlay ? renderOverlay(pad, methods) : null}
    </>
  );

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
            return renderHeader ? renderHeader(attrs) : null;
          }
          if (itemIndex === 2) {
            return renderFooter ? renderFooter(attrs) : null;
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
                render={(layout) => {
                  layoutRef.current.body = layout;
                  return null;
                }}
              />
            </Item>
          );
        }}
        render={(layout) => {
          layoutRef.current.box = layout;
          return null;
        }}
      />
    </Pad>
  );
});

export default Infinite;
