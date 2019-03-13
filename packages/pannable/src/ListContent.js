import React from 'react';

export default class ListContent extends React.PureComponent {
  static defaultProps = {
    direction: 'vertical',
    width: -1,
    height: -1,
    spacing: 0,
    itemCount: 0,
    estimatedItemWidth: 0,
    estimatedItemHeight: 0,
    renderItem: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  state = {
    size: { width: 0, height: 0 },
    layoutAttrs: [],
    itemHashList: [],
    itemSizeDict: {},
  };

  getSize() {
    return this.state.size;
  }

  componentDidMount() {
    this._calculateLayout();
  }

  componentDidUpdate(prevProps) {
    const {
      direction,
      width,
      height,
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
    } = this.props;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.spacing !== spacing ||
      prevProps.itemCount !== itemCount ||
      prevProps.estimatedItemWidth !== estimatedItemWidth ||
      prevProps.estimatedItemHeight !== estimatedItemHeight
    ) {
      this._calculateLayout();
    }
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const {
        direction,
        spacing,
        itemCount,
        estimatedItemWidth,
        estimatedItemHeight,
        onResize,
      } = props;
      const { itemHashList, itemSizeDict } = state;

      const nextState = calculateLayout(
        { width: estimatedItemWidth, height: estimatedItemHeight },
        itemHashList,
        itemSizeDict,
        itemCount,
        spacing,
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

  render() {
    const { itemCount, visibleRect, renderItem, children } = this.props;
    const { layoutAttrs } = this.state;

    if (typeof children === 'function') {
      return children(this);
    }

    const list = [];

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
        list.push(element);
      }
    }

    return <React.Fragment>{list}</React.Fragment>;
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

function calculateLayout(
  estimatedItemSize,
  itemHashList,
  itemSizeDict,
  itemCount,
  spacing,
  direction
) {
  const [x, y, width, height] =
    direction === 'horizontal'
      ? ['y', 'x', 'height', 'width']
      : ['x', 'y', 'width', 'height'];

  let sizeWidth = 0;
  let sizeHeight = 0;
  const layoutAttrs = [];

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    if (itemIndex > 0) {
      sizeHeight += spacing;
    }

    const itemHash = itemHashList[itemIndex];
    let itemSize = itemSizeDict[itemHash] || estimatedItemSize;

    layoutAttrs.push({
      [x]: 0,
      [y]: sizeHeight,
      [width]: itemSize[width],
      [height]: itemSize[height],
      itemIndex,
    });

    sizeHeight += itemSize[height];
    if (sizeWidth < itemSize[width]) {
      sizeWidth = itemSize[width];
    }
  }

  return {
    size: { [width]: sizeWidth, [height]: sizeHeight },
    layoutAttrs,
  };
}
