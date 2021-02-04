import PadContext from './PadContext';
import { XY, RC, WH, Rect, Size } from '../interfaces';
import { useIsomorphicLayoutEffect, usePrevious } from '../utils/hooks';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize, isNumber } from '../utils/geometry';
import React, { useContext, useMemo, useRef } from 'react';

export interface GridItemProps {
  forceRender?: boolean;
}

type GridLayoutOptions = {
  direction: XY;
  size: Record<WH, number | null>;
  spacing: Record<RC, number>;
  itemSize: Size;
  itemCount: number;
};

type GridLayoutItem = {
  rect: Rect;
  rowIndex: number;
  columnIndex: number;
  itemIndex: number;
};

export type GridLayoutAttrs = GridLayoutItem & {
  visibleRect: Rect;
  needsRender: boolean;
  Item: React.FC<GridItemProps>;
};

export type GridLayoutResult = {
  size: Size;
  count: Record<RC, number>;
  layoutList: GridLayoutItem[];
};

export interface GridContentProps {
  direction: XY;
  itemWidth: number;
  itemHeight: number;
  itemCount: number;
  renderItem: (attrs: GridLayoutAttrs) => React.ReactNode;
  width?: number | null;
  height?: number | null;
  rowSpacing?: number;
  columnSpacing?: number;
}

const Item: React.FC<GridItemProps> = React.memo(() => null);
function itemOnResize() {}

const defaultGridContentProps: GridContentProps = {
  direction: 'y',
  itemWidth: 0,
  itemHeight: 0,
  itemCount: 0,
  renderItem: () => null,
  width: null,
  height: null,
  rowSpacing: 0,
  columnSpacing: 0,
};

const GridContent: React.FC<GridContentProps &
  React.HTMLAttributes<HTMLDivElement>> = React.memo(props => {
  const context = useContext(PadContext);
  const {
    direction,
    itemWidth,
    itemHeight,
    itemCount,
    renderItem,
    width,
    height,
    rowSpacing,
    columnSpacing,
    children,
    ...divProps
  } = props as Required<GridContentProps> &
    React.HTMLAttributes<HTMLDivElement>;
  const fixedWidth = isNumber(width) ? width : context.width;
  const fixedHeight = isNumber(height) ? height : context.height;
  const layout = useMemo(
    () =>
      calculateLayout({
        direction,
        size: {
          width: fixedWidth,
          height: fixedHeight,
        },
        spacing: {
          row: rowSpacing,
          column: columnSpacing,
        },
        itemSize: {
          width: itemWidth,
          height: itemHeight,
        },
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
  const prevLayout = usePrevious(layout);
  const response = { onResize: context.onResize };
  const responseRef = useRef(response);
  responseRef.current = response;

  useIsomorphicLayoutEffect(() => {
    if (
      prevLayout.size === layout.size ||
      !isEqualToSize(prevLayout.size, layout.size)
    ) {
      responseRef.current.onResize(layout.size);
    }
  }, [layout.size]);

  function buildItem(attrs: GridLayoutAttrs): React.ReactNode {
    const { rect, itemIndex, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key: React.ReactText = 'GridContent_' + itemIndex;

    if (React.isValidElement(element) && element.type === Item) {
      const itemProps: GridItemProps = element.props;

      if (itemProps.forceRender !== undefined) {
        forceRender = itemProps.forceRender;
      }
      if (element.key) {
        key = element.key;
      }

      element = element.props.children;
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
          width: null,
          height: null,
          visibleRect,
          onResize: itemOnResize,
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

function calculateLayout(options: GridLayoutOptions): GridLayoutResult {
  const { direction, size, spacing, itemSize, itemCount } = options;

  const [x, y, width, height, row, column]: [XY, XY, WH, WH, RC, RC] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width', 'column', 'row']
      : ['x', 'y', 'width', 'height', 'row', 'column'];

  let sizeWidth = size[width];
  let sizeHeight = 0;
  let countRow = 0;
  let countColumn = 0;
  const layoutList = [];

  if (typeof sizeWidth !== 'number') {
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
      });
    }

    sizeHeight += itemSize[height];
  }

  return {
    size: { [width]: sizeWidth, [height]: sizeHeight },
    count: { [row]: countRow, [column]: countColumn },
    layoutList,
  } as GridLayoutResult;
}

GridContent.defaultProps = defaultGridContentProps;

export default GridContent;
