import React, {
  isValidElement,
  cloneElement,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import PadContext from './PadContext';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import { getItemVisibleRect, needsRender } from './utils/visible';
import { isEqualToSize } from './utils/geometry';

function Item() {}

const defaultGridContentProps = {
  width: null,
  height: null,
  direction: 'y',
  rowSpacing: 0,
  columnSpacing: 0,
  itemCount: 0,
  itemWidth: 0,
  itemHeight: 0,
  renderItem: () => null,
};

function GridContent(props) {
  const {
    width,
    height,
    direction,
    rowSpacing,
    columnSpacing,
    itemCount,
    itemWidth,
    itemHeight,
    renderItem,
    children,
    ...divProps
  } = props;
  const layout = useMemo(
    () =>
      calculateLayout({
        direction,
        width,
        height,
        rowSpacing,
        columnSpacing,
        itemCount,
        itemWidth,
        itemHeight,
      }),
    [
      direction,
      width,
      height,
      rowSpacing,
      columnSpacing,
      itemCount,
      itemWidth,
      itemHeight,
    ]
  );
  const prevLayoutRef = usePrevRef(layout);
  const context = useContext(PadContext);

  const { size, layoutList } = layout;
  const prevLayout = prevLayoutRef.current;

  const resizeContent = useCallback(() => {}, []);

  useIsomorphicLayoutEffect(() => {
    context.resizeContent(size);
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(prevLayout.size, size)) {
      context.resizeContent(size);
    }
  });

  function buildItem(attrs) {
    const { rect, itemIndex, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key = 'GridContent_' + itemIndex;
    const itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    if (isValidElement(element) && element.type === Item) {
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

    if (isValidElement(element)) {
      if (element.props.style) {
        Object.assign(itemStyle, element.props.style);
      }

      element = cloneElement(element, { style: itemStyle, ref: element.ref });
    } else {
      element = <div style={itemStyle}>{element}</div>;
    }

    return (
      <PadContext.Provider
        key={key}
        value={{ ...context, visibleRect, resizeContent }}
      >
        {element}
      </PadContext.Provider>
    );
  }

  const elemStyle = { position: 'relative' };

  if (size) {
    elemStyle.width = size.width;
    elemStyle.height = size.height;
  }

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }
  divProps.style = elemStyle;

  const items = layoutList.map(attrs =>
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

  return <div {...divProps}>{items}</div>;
}

function calculateLayout(props) {
  const {
    direction,
    rowSpacing,
    columnSpacing,
    itemCount,
    itemWidth,
    itemHeight,
  } = props;
  const size = { width: props.width, height: props.height };
  const itemSize = { width: itemWidth, height: itemHeight };
  const spacing = { row: rowSpacing, column: columnSpacing };

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
GridContent.PadContent = true;

export default GridContent;
