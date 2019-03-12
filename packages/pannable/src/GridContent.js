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

  getSize() {
    return this.state.size;
  }

  getCount() {
    return this.state.count;
  }

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
        onResize(nextState.size);
      }

      return nextState;
    });
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

    return {
      x: attrs.x,
      y: attrs.y,
      width: attrs.width,
      height: attrs.height,
    };
  }

  render() {
    const { itemCount, visibleRect, renderItem, children } = this.props;
    const { layoutAttrs } = this.state;

    if (typeof children === 'function') {
      return children(this);
    }

    const grids = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutAttrs[itemIndex];

      if (attrs && needsRender(attrs, visibleRect)) {
        let element = renderItem(attrs);

        const key = element.key || attrs.itemIndex;
        const style = {
          position: 'absolute',
          left: attrs.x,
          top: attrs.y,
          width: attrs.width,
          height: attrs.height,
          ...element.props.style,
        };

        element = React.cloneElement(element, { key, style });
        grids.push(element);
      }
    }

    return <React.Fragment>{grids}</React.Fragment>;
  }
}

function needsRender(rect, vRect, name) {
  if (name) {
    const dx = rect.x - vRect.x;

    return -0.25 * vRect.width < dx + rect.width && dx < 1.25 * vRect.width;
  }

  return (
    needsRender(rect, vRect, 'x') &&
    needsRender(
      { x: rect.y, y: rect.x, width: rect.height, height: rect.width },
      { x: vRect.y, y: vRect.x, width: vRect.height, height: vRect.width },
      'y'
    )
  );
}

function calculateItemIndex(index, count, direction) {
  if (!direction) {
    return index.column + index.row * count.column;
  }

  if (direction === 'vertical') {
    return calculateItemIndex(index, count);
  } else if (direction === 'horizontal') {
    return calculateItemIndex(
      { row: index.column, column: index.row },
      { row: count.column, column: count.row }
    );
  }
}

function calculateLayout(itemSize, itemCount, spacing, size, direction) {
  if (!direction) {
    let sizeWidth = size.width;
    let sizeHeight = 0;
    let columnCount = 0;
    let rowCount = 0;
    const layoutAttrs = [];

    if (sizeWidth < 0) {
      sizeWidth = itemCount * itemSize.width;

      if (itemCount > 1) {
        sizeWidth += (itemCount - 1) * spacing.column;
      }
      columnCount = itemCount;
    } else {
      if (itemSize.width === 0 && spacing.column === 0) {
        columnCount = itemCount;
      } else {
        columnCount = 1;

        if (itemSize.width < sizeWidth) {
          columnCount += Math.floor(
            (sizeWidth - itemSize.width) / (itemSize.width + spacing.column)
          );
        }
      }
    }

    if (columnCount > 0) {
      rowCount = Math.ceil(itemCount / columnCount);
    }

    if (rowCount > 0) {
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        if (rowIndex > 0) {
          sizeHeight += spacing.row + itemSize.height;
        }

        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          const itemIndex = columnIndex + rowIndex * columnCount;
          let x = 0;

          if (columnCount > 1) {
            x += Math.round(
              columnIndex * ((sizeWidth - itemSize.width) / (columnCount - 1))
            );
          }

          if (itemIndex < itemCount) {
            layoutAttrs.push({
              x,
              y: sizeHeight,
              width: itemSize.width,
              height: itemSize.height,
              rowIndex,
              columnIndex,
              itemIndex,
            });
          }
        }
      }

      sizeHeight += itemSize.height;
    }

    return {
      count: { row: rowCount, column: columnCount },
      size: { width: sizeWidth, height: sizeHeight },
      layoutAttrs,
    };
  }

  if (direction === 'vertical') {
    return calculateLayout(itemSize, itemCount, spacing, size);
  } else if (direction === 'horizontal') {
    const layout = calculateLayout(
      { width: itemSize.height, height: itemSize.width },
      itemCount,
      { row: spacing.column, column: spacing.row },
      { width: size.height, height: size.width }
    );

    return {
      size: { width: layout.size.height, height: layout.size.width },
      count: { row: layout.count.column, column: layout.count.row },
      layoutAttrs: layout.layoutAttrs.map(attrs => ({
        x: attrs.y,
        y: attrs.x,
        width: attrs.height,
        height: attrs.width,
        rowIndex: attrs.columnIndex,
        columnIndex: attrs.rowIndex,
        itemIndex: attrs.itemIndex,
      })),
    };
  }
}
