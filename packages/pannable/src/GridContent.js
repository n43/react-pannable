import React from 'react';

export default class GridContent extends React.PureComponent {
  static defaultProps = {
    direction: 'vertical',
    width: -1,
    height: -1,
    rowSpacing: 0,
    columnSpacing: 0,
    itemCount: 0,
    itemWidth: 0,
    itemHeight: 0,
    renderItem: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  state = {
    size: { width: 0, height: 0 },
    layoutAttrs: [],
    count: { row: 0, column: 0 },
  };

  componentDidMount() {
    this._calculateLayout();
  }

  componentDidUpdate(prevProps) {
    const {
      direction,
      width,
      height,
      rowSpacing,
      columnSpacing,
      itemCount,
      itemWidth,
      itemHeight,
    } = this.props;

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
  }

  getSize() {
    return this.state.size;
  }

  getCount() {
    return this.state.count;
  }

  getItemRect({ itemIndex, rowIndex, columnIndex }) {
    const { direction } = this.props;
    const { count, layoutAttrs } = this.state;

    if (rowIndex !== undefined && columnIndex !== undefined) {
      itemIndex = calculateItemIndex(
        { row: rowIndex, column: columnIndex },
        count,
        direction
      );
    }

    const attrs = layoutAttrs[itemIndex];

    if (!attrs) {
      return null;
    }

    return { x: attrs.x, y: attrs.y, width: attrs.width, height: attrs.height };
  }

  _calculateLayout() {
    this.setState((state, props) => {
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
      } = props;

      const nextState = calculateLayout(
        { width: itemWidth, height: itemHeight },
        itemCount,
        { row: rowSpacing, column: columnSpacing },
        { width, height },
        direction
      );

      if (
        state.size.width !== nextState.size.width ||
        state.size.height !== nextState.size.height
      ) {
        onResize({ ...nextState.size });
      }

      return nextState;
    });
  }

  render() {
    const { itemCount, visibleRect, renderItem, children } = this.props;
    const { layoutAttrs } = this.state;

    if (typeof children === 'function') {
      return children(this);
    }

    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutAttrs[itemIndex];

      if (attrs && needsRender(attrs, visibleRect)) {
        let element = renderItem({ ...attrs });

        const Item = element.type;
        const { style, ...props } = element.props;
        const key = element.key || attrs.itemIndex;
        const itemStyle = {
          position: 'absolute',
          left: attrs.x,
          top: attrs.y,
          width: attrs.width,
          height: attrs.height,
          ...style,
        };

        element = <Item {...props} key={key} style={itemStyle} />;

        items.push(element);
      }
    }

    return items;
  }
}

function needsRender(rect, vRect, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    const dx = rect[x] - vRect[x];
    return -0.25 * vRect[width] < dx + rect[width] && dx < 1.25 * vRect[width];
  }

  return needsRender(rect, vRect, 'x') && needsRender(rect, vRect, 'y');
}

function calculateItemIndex(index, count, direction) {
  const [row, column] =
    direction === 'horizontal' ? ['column', 'row'] : ['row', 'column'];

  return index[column] + index[row] * count[column];
}

function calculateLayout(itemSize, itemCount, spacing, size, direction) {
  const [x, y, width, height, row, column] =
    direction === 'horizontal'
      ? ['y', 'x', 'height', 'width', 'column', 'row']
      : ['x', 'y', 'width', 'height', 'row', 'column'];

  let sizeWidth = size[width];
  let sizeHeight = 0;
  let countRow = 0;
  let countColumn = 0;
  const layoutAttrs = [];

  if (sizeWidth < 0) {
    sizeWidth = itemCount * itemSize[width];

    if (itemCount > 1) {
      sizeWidth += (itemCount - 1) * spacing[column];
    }
    countColumn = itemCount;
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

      if (itemIndex < itemCount) {
        layoutAttrs.push({
          [x]: attrX,
          [y]: sizeHeight,
          [width]: itemSize[width],
          [height]: itemSize[height],
          [row + 'Index']: rowIndex,
          [column + 'Index']: columnIndex,
          itemIndex,
        });
      }
    }

    sizeHeight += itemSize[height];
  }

  return {
    count: { [row]: countRow, [column]: countColumn },
    size: { [width]: sizeWidth, [height]: sizeHeight },
    layoutAttrs,
  };
}
