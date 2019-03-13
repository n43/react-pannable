import React from 'react';
import ItemContent from './ItemContent';

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

  getSize() {
    return this.state.size;
  }

  getItemRect({ itemIndex }) {
    const { layoutAttrs } = this.state;
    const attrs = layoutAttrs[itemIndex];

    if (!attrs) {
      return null;
    }

    return { x: attrs.x, y: attrs.y, width: attrs.width, height: attrs.height };
  }

  _calculateLayout(itemIndex, itemHash, itemSize) {
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
      let nextItemHashList = itemHashList;
      let nextItemSizeDict = itemSizeDict;

      if (itemIndex !== undefined) {
        if (nextItemHashList[itemIndex] === itemHash) {
          return null;
        }

        nextItemHashList = [...nextItemHashList];
        nextItemHashList[itemIndex] = itemHash;
        nextItemSizeDict = { ...nextItemSizeDict, [itemHash]: itemSize };
      }

      const nextState = calculateLayout(
        { width: estimatedItemWidth, height: estimatedItemHeight },
        nextItemHashList,
        nextItemSizeDict,
        itemCount,
        spacing,
        direction
      );

      if (nextItemHashList !== itemHashList) {
        nextState.itemHashList = nextItemHashList;
      }
      if (nextItemSizeDict !== itemSizeDict) {
        nextState.itemSizeDict = nextItemSizeDict;
      }

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
    const {
      direction,
      width,
      height,
      itemCount,
      visibleRect,
      renderItem,
      children,
    } = this.props;
    const { itemSizeDict, layoutAttrs } = this.state;

    if (typeof children === 'function') {
      return children(this);
    }

    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutAttrs[itemIndex];

      if (attrs && needsRender(attrs, visibleRect)) {
        let element = renderItem({ ...attrs, Item: ItemContent });

        const Item = element.type;
        const { onResize, style, ...props } = element.props;
        const key = element.key || attrs.itemIndex;
        const itemStyle = {
          position: 'absolute',
          left: attrs.x,
          top: attrs.y,
          width: attrs.width,
          height: attrs.height,
          ...style,
        };

        if (Item === ItemContent) {
          props.onResize = (size, hash) => {
            this._calculateLayout(itemIndex, hash, size);

            onResize(size);
          };
          props.getSizeByHash = hash => itemSizeDict[hash];

          if (direction === 'horizontal') {
            props.height = height;
          } else {
            props.width = width;
          }

          element = (
            <div key={key} style={itemStyle}>
              <Item {...props} />
            </div>
          );
        } else {
          element = <Item {...props} key={key} style={itemStyle} />;
        }

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
