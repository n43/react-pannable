import PadContext from './PadContext';
import { XY, WH, Rect, Size } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize } from '../utils/geometry';
import React, { useContext, useMemo, useRef, useState } from 'react';

type Hash = string | number;

export interface ListItemProps {
  forceRender?: boolean;
  hash?: Hash;
  style?: React.CSSProperties;
}
const Item = React.memo<ListItemProps>((props) => null);

export type ListLayoutItem = {
  rect: Rect;
  itemIndex: number;
  itemHash: Hash;
  itemSize?: Size;
};

export type ListLayout = {
  size: Size;
  layoutList: ListLayoutItem[];
};

export type ListLayoutAttrs = ListLayoutItem & {
  visibleRect: Rect;
  needsRender: boolean;
  Item: React.FC<ListItemProps>;
};

export interface ListContentProps {
  itemCount: number;
  renderItem: (attrs: ListLayoutAttrs) => React.ReactNode;
  direction?: XY;
  width?: number;
  height?: number;
  spacing?: number;
  estimatedItemWidth?: number | ((itemIndex: number) => number);
  estimatedItemHeight?: number | ((itemIndex: number) => number);
  render?: (layout: ListLayout) => React.ReactNode;
}

export const ListContent = React.memo<
  React.ComponentProps<'div'> & ListContentProps
>((props) => {
  const {
    itemCount,
    renderItem,
    direction = 'y',
    width,
    height,
    spacing = 0,
    estimatedItemWidth = 0,
    estimatedItemHeight = 0,
    render,
    children,
    ...divProps
  } = props;
  const context = useContext(PadContext);

  const fixedWidth = width ?? context.width;
  const fixedHeight = height ?? context.height;
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
  const prevSizeRef = useRef<Size>();
  const delegate = { onResize: context.onResize };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useIsomorphicLayoutEffect(() => {
    const prevSize = prevSizeRef.current;
    prevSizeRef.current = layout.size;

    if (!isEqualToSize(prevSize, layout.size)) {
      delegateRef.current.onResize(layout.size);
    }
  }, [layout.size]);

  const nextItemHashList: Hash[] = [];

  function buildItem(attrs: ListLayoutAttrs): React.ReactNode {
    const { rect, itemIndex, itemSize, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key: React.Key = `ListContent_` + itemIndex;
    let hash: Hash | null = null;
    const itemStyle: React.CSSProperties = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    if (React.isValidElement(element) && element.type === Item) {
      if (element.key) {
        key = element.key;
      }

      const itemProps: ListItemProps = element.props;

      if (itemProps.forceRender !== undefined) {
        forceRender = itemProps.forceRender;
      }
      if (itemProps.hash !== undefined) {
        hash = itemProps.hash;
      }
      if (itemProps.style !== undefined) {
        Object.assign(itemStyle, itemProps.style);
      }

      element = element.props.children;
    }

    if (hash === null) {
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

    const contextValue = { ...context };

    contextValue.visibleRect = visibleRect;
    contextValue.onResize = (itemSize) => {
      setItemSizeDict((itemSizeDict) => {
        if (!hash) {
          return itemSizeDict;
        }

        if (isEqualToSize(itemSizeDict[hash], itemSize)) {
          return itemSizeDict;
        }

        return { ...itemSizeDict, [hash]: itemSize };
      });
    };

    if (direction === 'x') {
      contextValue.height = layout.size.height;
    } else {
      contextValue.width = layout.size.width;
    }

    return (
      <div key={key} style={itemStyle}>
        <PadContext.Provider value={contextValue}>
          {element}
        </PadContext.Provider>
      </div>
    );
  }

  const items = layout.layoutList.map((attrs) =>
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

  if (render) {
    render(layout);
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

export default ListContent;

function calculateLayout(
  options: {
    direction: XY;
    size: Partial<Size>;
    spacing: number;
    estimatedItemSize: Record<WH, number | ((itemIndex: number) => number)>;
    itemCount: number;
  },
  itemHashList: Hash[],
  itemSizeDict: Record<Hash, Size>
): ListLayout {
  const { direction, size, spacing, estimatedItemSize, itemCount } = options;

  const [x, y, width, height]: [XY, XY, WH, WH] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width']
      : ['x', 'y', 'width', 'height'];

  let sizeWidth = 0;
  let sizeHeight = 0;
  const layoutList: ListLayoutItem[] = [];
  const fixed: Partial<Size> = {};

  if (size[width] !== undefined) {
    fixed[width] = size[width];
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
        fixed[width] ??
        (typeof eisWidth === 'function' ? eisWidth(itemIndex) : eisWidth);

      rect[height] =
        typeof eisHeight === 'function' ? eisHeight(itemIndex) : eisHeight;
    }

    layoutList.push({ rect, itemIndex, itemHash, itemSize } as ListLayoutItem);

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
      [width]: fixed[width] ?? sizeWidth,
      [height]: fixed[height] ?? sizeHeight,
    } as Size,
    layoutList,
  };
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
