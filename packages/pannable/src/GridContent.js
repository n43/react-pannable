import React from 'react';
import PadContext from './PadContext';
import { getItemVisibleRect, needsRender } from './utils/visible';
import { isEqualToSize } from './utils/geometry';

function Item() {}

export default class GridContent extends React.Component {
  static defaultProps = {
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

  static contextType = PadContext;

  state = {
    layoutHash: '',
    size: null,
    count: null,
    layoutList: null,
  };

  static getDerivedStateFromProps(props, state) {
    const {
      direction,
      width,
      height,
      rowSpacing,
      columnSpacing,
      itemCount,
      itemWidth,
      itemHeight,
    } = props;
    const { size, layoutHash } = state;
    let nextState = null;

    const nextLayoutHash = [
      direction,
      width,
      height,
      rowSpacing,
      columnSpacing,
      itemCount,
      itemWidth,
      itemHeight,
    ].join();

    if (nextLayoutHash !== layoutHash) {
      const layout = calculateLayout(props);

      nextState = nextState || {};

      nextState.layoutHash = nextLayoutHash;
      nextState.count = layout.count;
      nextState.layoutList = layout.layoutList;

      if (!isEqualToSize(layout.size, size)) {
        nextState.size = layout.size;
      }
    }

    return nextState;
  }

  componentDidMount() {
    const { size } = this.state;

    if (size) {
      this.context.onContentResize(size);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { size } = this.state;

    if (size !== prevState.size) {
      if (size) {
        this.context.onContentResize(size);
      }
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

  _onItemResize = () => {};

  _renderItem(layoutAttrs) {
    const { renderItem } = this.props;

    const { itemIndex, rect, visibleRect, needsRender, Item } = layoutAttrs;
    let element = renderItem(layoutAttrs);
    let itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };
    let forceRender;
    let key;

    if (React.isValidElement(element) && element.type === Item) {
      if (element.props.style) {
        itemStyle = { ...itemStyle, ...element.props.style };
      }
      forceRender = element.props.forceRender;
      key = element.key;

      element = element.props.children;
    }

    if (!key) {
      key = '' + itemIndex;
    }
    if (!(forceRender || needsRender)) {
      return null;
    }

    if (!React.isValidElement(element)) {
      element = <div style={itemStyle}>{element}</div>;
    } else {
      if (element.props.style) {
        itemStyle = { ...itemStyle, ...element.props.style };
      }

      element = React.cloneElement(element, {
        ref: element.ref,
        style: itemStyle,
      });
    }

    return (
      <PadContext.Provider
        key={key}
        value={{
          ...this.context,
          visibleRect,
          onContentResize: this._onItemResize,
        }}
      >
        {element}
      </PadContext.Provider>
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
      ...props
    } = this.props;
    const { visibleRect } = this.context;
    const { size, layoutList } = this.state;

    const elemStyle = { position: 'relative' };

    if (size) {
      elemStyle.width = size.width;
      elemStyle.height = size.height;
    }

    props.style = {
      ...elemStyle,
      ...props.style,
    };

    const items = [];

    for (let itemIndex = 0; itemIndex < layoutList.length; itemIndex++) {
      const attrs = layoutList[itemIndex];
      const layoutAttrs = {
        ...attrs,
        itemIndex,
        visibleRect: getItemVisibleRect(attrs.rect, visibleRect),
        needsRender: needsRender(attrs.rect, visibleRect),
        Item,
      };

      items.push(this._renderItem(layoutAttrs));
    }

    return <div {...props}>{items}</div>;
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
