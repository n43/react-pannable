import React, { useContext, useMemo, useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize, isNumber } from '../utils/geometry';
import PadContext from './PadContext';

function Item() {}
function onPadContentResize() {}

const defaultGridContentProps = {
  width: null,
  height: null,
  direction: 'y',
  rowSpacing: 0,
  columnSpacing: 0,
  itemWidth: 0,
  itemHeight: 0,
  itemCount: 0,
  renderItem: () => null,
};

function GridContent(props) {
  const context = useContext(PadContext);
  const {
    width,
    height,
    direction,
    rowSpacing,
    columnSpacing,
    itemWidth,
    itemHeight,
    itemCount,
    renderItem,
    children,
    ...divProps
  } = props;
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
  const prevLayoutRef = usePrevRef(layout);
  const prevLayout = prevLayoutRef.current;
  const responseRef = useRef({});

  responseRef.current.onResize = context.onResize;

  useIsomorphicLayoutEffect(() => {
    if (
      prevLayout.size === layout.size ||
      !isEqualToSize(prevLayout.size, layout.size)
    ) {
      responseRef.current.onResize(layout.size);
    }
  }, [layout.size]);

  function buildItem(attrs) {
    const { rect, itemIndex, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key = 'GridContent_' + itemIndex;

    if (React.isValidElement(element) && element.type === Item) {
      if (element.props.forceRender !== undefined) {
        forceRender = element.props.forceRender;
      }
      if (element.key) {
        key = element.key;
      }

      element = element.props.children;
    }

    if (!needsRender && !forceRender) {
      return null;
    }

    const itemStyle = {
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
          onResize: onPadContentResize,
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
    const style = { position: 'relative', overflow: 'hidden' };

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
}

function calculateLayout(props) {
  const { direction, size, spacing, itemSize, itemCount } = props;

  const [x, y, width, height, row, column] =
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
  };
}

GridContent.defaultProps = defaultGridContentProps;

export default GridContent;
