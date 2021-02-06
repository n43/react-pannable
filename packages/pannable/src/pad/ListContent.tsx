import PadContext from './PadContext';
import { XY, WH, Rect, Size } from '../interfaces';
import { useIsomorphicLayoutEffect, usePrevious } from '../utils/hooks';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize, isNumber } from '../utils/geometry';
import React, { useContext, useMemo, useRef, useState } from 'react';

type Hash = React.ReactText;

export interface ListItemProps {
  forceRender?: boolean;
  hash?: Hash;
}

type ListLayoutOptions = {
  direction: XY;
  size: Record<WH, number | null>;
  spacing: number;
  estimatedItemSize: Record<WH, number | ((itemIndex: number) => number)>;
  itemCount: number;
};

type ListLayoutItem = {
  rect: Rect;
  itemIndex: number;
  itemHash: Hash;
  itemSize: Size | null;
};

export type ListLayoutAttrs = ListLayoutItem & {
  visibleRect: Rect;
  needsRender: boolean;
  Item: React.FC<ListItemProps>;
};

export type ListLayoutResult = {
  size: Size;
  layoutList: ListLayoutItem[];
};

export interface ListContentProps {
  direction: XY;
  itemCount: number;
  renderItem: (attrs: ListLayoutAttrs) => React.ReactNode;
  width?: number | null;
  height?: number | null;
  spacing?: number;
  estimatedItemWidth?: number | ((itemIndex: number) => number);
  estimatedItemHeight?: number | ((itemIndex: number) => number);
}

const Item: React.FC<ListItemProps> = React.memo(() => null);

const defaultListContentProps: ListContentProps = {
  direction: 'y',
  itemCount: 0,
  renderItem: () => null,
  width: null,
  height: null,
  spacing: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
};

const ListContent: React.FC<ListContentProps &
  React.HTMLAttributes<HTMLDivElement>> = React.memo(props => {
  const context = useContext(PadContext);
  const {
    direction,
    itemCount,
    renderItem,
    width,
    height,
    spacing,
    estimatedItemWidth,
    estimatedItemHeight,
    children,
    ...divProps
  } = props as Required<ListContentProps> &
    React.HTMLAttributes<HTMLDivElement>;
  const fixedWidth = isNumber(width) ? (width as number) : context.width;
  const fixedHeight = isNumber(height) ? (height as number) : context.height;
  const [itemHashList, setItemHashList] = useState<Hash[]>([]);
  const [itemSizeDict, setItemSizeDict] = useState<Record<Hash, Size>>({});
  const layout = useMemo(
    () =>
      calculateLayout(
        {
          direction,
          size: {
            width: fixedWidth,
            height: fixedHeight,
          },
          spacing,
          estimatedItemSize: {
            width: estimatedItemWidth,
            height: estimatedItemHeight,
          },
          itemCount,
        },
        itemHashList,
        itemSizeDict
      ),
    [
      fixedWidth,
      fixedHeight,
      direction,
      spacing,
      estimatedItemWidth,
      estimatedItemHeight,
      itemCount,
      itemHashList,
      itemSizeDict,
    ]
  );
  const prevLayout = usePrevious(layout);
  const delegate = { onResize: context.onResize };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useIsomorphicLayoutEffect(() => {
    if (
      prevLayout.size === layout.size ||
      !isEqualToSize(prevLayout.size, layout.size)
    ) {
      delegateRef.current.onResize(layout.size);
    }
  }, [layout.size]);

  const nextItemHashList: Hash[] = [];

  function buildItem(attrs: ListLayoutAttrs): React.ReactNode {
    const { rect, itemIndex, itemSize, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key: React.ReactText = `ListContent_` + itemIndex;
    let hash: Hash = '';

    if (React.isValidElement(element) && element.type === Item) {
      const itemProps: ListItemProps = element.props;

      if (itemProps.forceRender !== undefined) {
        forceRender = itemProps.forceRender;
      }
      if (element.key) {
        key = element.key;
      }
      if (itemProps.hash !== undefined) {
        hash = itemProps.hash;
      }

      element = element.props.children;
    }

    if (hash === '') {
      hash = key;
    }

    let skipRender = !needsRender && !forceRender;

    if (!itemSize && nextItemHashList.indexOf(hash) !== -1) {
      skipRender = true;
    }

    nextItemHashList[itemIndex] = hash;

    if (skipRender) {
      return null;
    }

    const itemStyle: React.CSSProperties = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    return (
      <PadContext.Provider
        key={key}
        value={{
          ...context,
          width: null,
          height: null,
          ...itemSize,
          visibleRect,
          onResize: itemSize => {
            setItemSizeDict(itemSizeDict => ({
              ...itemSizeDict,
              [hash]: itemSize,
            }));
          },
        }}
      >
        <div style={itemStyle}>{element}</div>
      </PadContext.Provider>
    );
  }

  const items = layout.layoutList.map(attrs =>
    buildItem({
      ...attrs,
      visibleRect: getItemVisibleRect(attrs.rect, context.visibleRect),
      needsRender: needsRender(attrs.rect, context.visibleRect),
      Item,
    })
  );

  if (!isEqualToArray(itemHashList, nextItemHashList)) {
    setItemHashList(nextItemHashList);
  }

  if (typeof children === 'function') {
    children(layout);
  }

  const divStyle = useMemo(() => {
    const style: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
    };

    if (layout.size) {
      style.width = layout.size.width;
      style.height = layout.size.height;
    }

    if (divProps.style) {
      Object.assign(style, divProps.style);
    }

    return style;
  }, [layout.size, divProps.style]);

  divProps.style = divStyle;

  return <div {...divProps}>{items}</div>;
});

ListContent.defaultProps = defaultListContentProps;

export default ListContent;

function calculateLayout(
  options: ListLayoutOptions,
  itemHashList: Hash[],
  itemSizeDict: Record<Hash, Size>
): ListLayoutResult {
  const { direction, size, spacing, estimatedItemSize, itemCount } = options;

  const [x, y, width, height]: [XY, XY, WH, WH] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width']
      : ['x', 'y', 'width', 'height'];

  let sizeWidth = 0;
  let sizeHeight = 0;
  const layoutList = [];
  const fixed: any = {};

  if (isNumber(size[width])) {
    fixed[width] = size[width] as number;
  }

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const itemHash = itemHashList[itemIndex] || null;
    const itemSize = (itemHash && itemSizeDict[itemHash]) || null;
    const rect = { [x]: 0, [y]: sizeHeight };

    if (itemSize) {
      Object.assign(rect, itemSize);
    } else {
      const eisWidth = estimatedItemSize[width];
      const eisHeight = estimatedItemSize[height];

      rect[width] =
        fixed[width] !== undefined
          ? fixed[width]
          : typeof eisWidth === 'function'
          ? eisWidth(itemIndex)
          : eisWidth;

      rect[height] =
        typeof eisHeight === 'function' ? eisHeight(itemIndex) : eisHeight;
    }

    layoutList.push({ rect, itemIndex, itemHash, itemSize });

    if (rect[height] > 0) {
      sizeHeight += rect[height];

      if (itemIndex < itemCount - 1) {
        sizeHeight += spacing;
      }
    }
    if (sizeWidth < rect[width]) {
      sizeWidth = rect[width];
    }
  }

  return {
    size: {
      [width]: fixed[width] !== undefined ? fixed[width] : sizeWidth,
      [height]: fixed[height] !== undefined ? fixed[height] : sizeHeight,
    },
    layoutList,
  } as ListLayoutResult;
}

function isEqualToArray(a1: any[], a2: any[]): boolean {
  if (!a1 || !a2) {
    return false;
  }
  if (a1 === a2) {
    return true;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  for (let idx = 0; idx < a1.length; idx++) {
    if (a1[idx] !== a2[idx]) {
      return false;
    }
  }

  return true;
}
