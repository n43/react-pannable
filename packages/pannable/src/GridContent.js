import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';

export default class GridContent extends React.Component {
  static defaultProps = {
    direction: 'y',
    width: null,
    height: null,
    rowSpacing: 0,
    columnSpacing: 0,
    itemCount: 0,
    itemWidth: 0,
    itemHeight: 0,
    renderItem: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const layout = calculateLayout(props);

    this.state = {
      size: layout.size,
      count: layout.count,
      layoutList: layout.layoutList,
    };
  }

  componentDidMount() {
    this.props.onResize(this.state.size);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      direction,
      width,
      height,
      rowSpacing,
      columnSpacing,
      itemCount,
      itemWidth,
      itemHeight,
      onResize,
    } = this.props;
    const { size } = this.state;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.rowSpacing !== rowSpacing ||
      prevProps.columnSpacing !== columnSpacing ||
      prevProps.itemCount !== itemCount ||
      prevProps.itemWidth !== itemWidth ||
      prevProps.itemHeight !== itemHeight
    ) {
      this._calculateLayout();
    }
    if (prevState.size !== size) {
      onResize(size);
    }
  }

  getSize() {
    return this.state.size;
  }
  getCount() {
    return this.state.count;
  }

  getItemRect({ itemIndex, rowIndex, columnIndex }) {
    const { direction } = this.props;
    const { count, layoutList } = this.state;

    if (rowIndex !== undefined && columnIndex !== undefined) {
      itemIndex = calculateItemIndex(
        { row: rowIndex, column: columnIndex },
        count,
        direction
      );
    }

    const attrs = layoutList[itemIndex];

    return (attrs && attrs.rect) || null;
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const { size } = state;
      const nextState = {};

      const layout = calculateLayout(props);

      nextState.count = layout.count;
      nextState.layoutList = layout.layoutList;

      if (
        layout.size.width !== size.width ||
        layout.size.height !== size.height
      ) {
        nextState.size = layout.size;
      }

      return nextState;
    });
  }

  _renderItem(layoutAttrs) {
    const { renderItem } = this.props;

    const { itemIndex, rect } = layoutAttrs;
    let key = itemIndex;
    const element = renderItem(layoutAttrs);

    if (React.isValidElement(element)) {
      if (element.key !== undefined) {
        key = element.key;
      }
    }

    const itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    return (
      <div key={key} style={itemStyle}>
        {element}
      </div>
    );
  }

  render() {
    const {
      direction,
      width,
      height,
      rowSpacing,
      columnSpacing,
      itemCount,
      itemWidth,
      itemHeight,
      renderItem,
      visibleRect,
      onResize,
      ...props
    } = this.props;
    const { size, layoutList } = this.state;

    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutList[itemIndex];
      const layoutAttrs = {
        ...attrs,
        itemIndex,
        visibleRect: getItemVisibleRect(attrs.rect, visibleRect),
      };

      if (needsRender(layoutAttrs.rect, visibleRect)) {
        items.push(this._renderItem(layoutAttrs));
      }
    }

    props.children = items;
    props.style = {
      position: 'relative',
      width: size.width,
      height: size.height,
      ...props.style,
    };

    return <div {...props} />;
  }
}

function calculateItemIndex(index, count, direction) {
  const [row, column] =
    direction === 'x' ? ['column', 'row'] : ['row', 'column'];

  return index[column] + index[row] * count[column];
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
  const size = {
    width: typeof props.width === 'number' ? props.width : 0,
    height: typeof props.height === 'number' ? props.height : 0,
  };
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

  if (sizeWidth <= 0) {
    countColumn = itemCount;
    sizeWidth = itemCount * itemSize[width];

    if (itemCount > 1) {
      sizeWidth += (itemCount - 1) * spacing[column];
    }
  } else {
    if (itemSize[width] === 0 && spacing[column] === 0) {
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
