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
  scrollTo?: InfiniteScrollTo | null;
  render?: (state: InfiniteState, methods: InfiniteMethods) => React.ReactNode;
  infiniteStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

export const Infinite = React.memo<
  Omit<React.ComponentProps<typeof Pad>, 'render' | 'scrollTo'> & InfiniteProps
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
    scrollTo,
    render,
    infiniteStyle,
    bodyStyle,
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
    if (scrollTo) {
      const methods = methodsRef.current;

      if (methods) {
        methods.scrollTo(scrollTo);
      }
    }
  }, [scrollTo]);

  padProps.directionalLockEnabled = directionalLockEnabled;

  if (direction === 'x') {
    padProps.boundY = padProps.boundY ?? 0;
  } else {
    padProps.boundX = padProps.boundX ?? 0;
  }

  padProps.renderOverlay = (pad, padMethods) => (
    <>
      <InfiniteInner
        direction={direction}
        pad={pad}
        padMethods={padMethods}
        layout={layoutRef.current}
        render={(state, methods) => {
          methodsRef.current = methods;

          return render ? render(state, methods) : children;
        }}
      />
      {renderOverlay ? renderOverlay(pad, padMethods) : null}
    </>
  );

  return (
    <Pad {...padProps}>
      <ListContent
        width={width}
        height={height}
        direction={direction}
        itemCount={3}
        style={infiniteStyle}
        renderItem={(attrs) => {
          const { itemIndex, Item } = attrs;

          if (itemIndex === 0) {
            return renderHeader ? renderHeader(attrs) : null;
          }
          if (itemIndex === 2) {
            return renderFooter ? renderFooter(attrs) : null;
          }

          return (
            <Item forceRender style={bodyStyle}>
              <ListContent
                width={width}
                height={height}
                direction={direction}
                spacing={spacing}
                itemCount={itemCount}
                estimatedItemWidth={estimatedItemWidth}
                estimatedItemHeight={estimatedItemHeight}
                style={bodyStyle}
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
