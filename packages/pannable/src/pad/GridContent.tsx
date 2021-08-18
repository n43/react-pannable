import PadContext from './PadContext';
import { XY, RC, WH, Rect, Size } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize } from '../utils/geometry';
import React, { useContext, useMemo, useRef } from 'react';

function itemOnResize() {}

export interface GridItemProps {
  forceRender?: boolean;
}
const Item = React.memo<GridItemProps>((props) => null);

export type GridLayoutItem = {
  rect: Rect;
  rowIndex: number;
  columnIndex: number;
  itemIndex: number;
};
export type GridLayout = {
  size: Size;
  count: Record<RC, number>;
  layoutList: GridLayoutItem[];
};
export type GridLayoutAttrs = GridLayoutItem & {
  visibleRect: Rect;
  needsRender: boolean;
  Item: React.FC<GridItemProps>;
};

export interface GridContentProps {
  itemWidth: number;
  itemHeight: number;
  itemCount: number;
  renderItem: (attrs: GridLayoutAttrs) => React.ReactNode;
  direction?: XY;
  width?: number;
  height?: number;
  rowSpacing?: number;
  columnSpacing?: number;
  render?: (layout: GridLayout) => React.ReactNode;
}

export const GridContent = React.memo<
  React.ComponentProps<'div'> & GridContentProps
>((props) => {
  const {
    itemWidth,
    itemHeight,
    itemCount,
    renderItem,
    direction = 'y',
    rowSpacing = 0,
    columnSpacing = 0,
    width,
    height,
    render,
    children,
    ...divProps
  } = props;
  const context = useContext(PadContext);

  const fixedWidth = width ?? context.width;
  const fixedHeight = height ?? context.height;
  const layout = useMemo(
    () =>
      calculateLayout({
        direction,
        size: { width: fixedWidth, height: fixedHeight },
        spacing: { row: rowSpacing, column: columnSpacing },
        itemSize: { width: itemWidth, height: itemHeight },
        itemCount,
      }),
    [
      direction,
      fixedWidth,
      fixedHeight,
      rowSpacing,
      columnSpacing,
      itemWidth,
      itemHeight,
      itemCount,
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

  function buildItem(attrs: GridLayoutAttrs): React.ReactNode {
    const { rect, itemIndex, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let elem = renderItem(attrs);

    let key: React.Key = 'GridContent_' + itemIndex;

    if (React.isValidElement(elem) && elem.type === Item) {
      if (elem.key) {
        key = elem.key;
      }

      const itemProps: GridItemProps = elem.props;

      if (itemProps.forceRender !== undefined) {
        forceRender = itemProps.forceRender;
      }

      elem = elem.props.children;
    }

    if (!needsRender && !forceRender) {
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
          width: itemWidth,
          height: itemHeight,
          visibleRect,
          onResize: itemOnResize,
        }}
      >
        <div style={itemStyle}>{elem}</div>
      </PadContext.Provider>
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

export default GridContent;

function calculateLayout(options: {
  direction: XY;
  size: Partial<Size>;
  spacing: Record<RC, number>;
  itemSize: Size;
  itemCount: number;
}): GridLayout {
  const { direction, size, spacing, itemSize, itemCount } = options;

  const [x, y, width, height, row, column]: [XY, XY, WH, WH, RC, RC] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width', 'column', 'row']
      : ['x', 'y', 'width', 'height', 'row', 'column'];

  let sizeWidth = size[width];
  let sizeHeight = 0;
  let countRow = 0;
  let countColumn = 0;
  const layoutList: GridLayoutItem[] = [];

  if (sizeWidth === undefined) {
    countColumn = itemCount;

    if (itemSize[width] === 0) {
      sizeWidth = 0;
    } else {
      sizeWidth = itemCount * itemSize[width];

      if (itemCount > 1) {
        sizeWidth += (itemCount - 1) * spacing[column];
      }
    }
  } else {
    if (itemSize[width] === 0) {
      countColumn = itemCount;
    } else {
      countColumn = 1;

      if (itemSize[width] < sizeWidth) {
        countColumn += Math.floor(
          (sizeWidth - itemSize[width]) / (itemSize[width] + spacing[column])
        );
      }
    }
  }

  if (countColumn > 0) {
    countRow = Math.ceil(itemCount / countColumn);
  }

  for (let rowIndex = 0; rowIndex < countRow; rowIndex++) {
    if (rowIndex > 0) {
      sizeHeight += spacing[row];
    }

    for (let columnIndex = 0; columnIndex < countColumn; columnIndex++) {
      const itemIndex = columnIndex + rowIndex * countColumn;
      let attrX = 0;

      if (countColumn > 1) {
        attrX += Math.round(
          columnIndex * ((sizeWidth - itemSize[width]) / (countColumn - 1))
        );
      }

      if (itemIndex >= itemCount) {
        break;
      }

      layoutList.push({
        rect: {
          [x]: attrX,
          [y]: sizeHeight,
          [width]: itemSize[width],
          [height]: itemSize[height],
        },
        [row + 'Index']: rowIndex,
        [column + 'Index']: columnIndex,
        itemIndex,
      } as GridLayoutItem);
    }

    sizeHeight += itemSize[height];
  }

  return {
    size: { [width]: sizeWidth, [height]: sizeHeight } as Size,
    count: { [row]: countRow, [column]: countColumn } as Record<RC, number>,
    layoutList,
  };
}
