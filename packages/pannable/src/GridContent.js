import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';

export default class GridContent extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    width: 0,
    height: 0,
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

    props.onResize(layout.size);

    this.state = {
      size: layout.size,
      count: layout.count,
      layoutAttrs: layout.layoutAttrs,
    };
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

    return attrs.rect;
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const nextState = {};
      const layout = calculateLayout(props);

      if (
        layout.size.width !== state.size.width ||
        layout.size.height !== state.size.height
      ) {
        nextState.size = layout.size;
        props.onResize(layout.size);
      }

      return nextState;
    });
  }

  _renderItem(itemIndex, attrs, visibleRect) {
    const { renderItem } = this.props;
    const element = renderItem({ ...attrs, itemIndex, visibleRect });

    const Item = element.type;
    const { style, ...props } = element.props;
    const key = element.key || itemIndex;
    const itemStyle = {
      position: 'absolute',
      left: attrs.rect.x,
      top: attrs.rect.y,
      width: attrs.rect.width,
      height: attrs.rect.height,
      ...style,
    };

    return <Item {...props} key={key} style={itemStyle} />;
  }

  render() {
    const { itemCount, visibleRect } = this.props;
    const { layoutAttrs } = this.state;
    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutAttrs[itemIndex];

      if (attrs && needsRender(attrs.rect, visibleRect)) {
        items.push(
          this._renderItem(
            itemIndex,
            attrs,
            getItemVisibleRect(attrs.rect, visibleRect)
          )
        );
      }
    }

    return items;
  }
}

function calculateItemIndex(index, count, direction) {
  const [row, column] =
    direction === 'x' ? ['column', 'row'] : ['row', 'column'];

  return index[column] + index[row] * count[column];
}

function calculateLayout(props) {
  const { direction, itemCount } = props;
  const size = { width: props.width, height: props.height };
  const itemSize = { width: props.itemWidth, height: props.itemWidth };
  const spacing = { row: props.rowSpacing, column: props.columnSpacing };

  const [x, y, width, height, row, column] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width', 'column', 'row']
      : ['x', 'y', 'width', 'height', 'row', 'column'];

  let sizeWidth = size[width];
  let sizeHeight = 0;
  let countRow = 0;
  let countColumn = 0;
  const layoutAttrs = [];

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

      layoutAttrs.push({
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
    layoutAttrs,
  };
}
