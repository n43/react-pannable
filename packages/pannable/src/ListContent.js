import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';
import ItemContent from './ItemContent';

export default class ListContent extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
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

    return attrs.rect;
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
        onResize(nextState.size);
      }

      return nextState;
    });
  }

  _renderItem(attrs, visibleRect) {
    const { direction, width, height, renderItem } = this.props;
    const { itemSizeDict } = this.state;

    let element = renderItem({ ...attrs, visibleRect, Item: ItemContent });
    const key = element.key || attrs.itemIndex;
    const itemStyle = {
      position: 'absolute',
      left: attrs.rect.x,
      top: attrs.rect.y,
      width: attrs.rect.width,
      height: attrs.rect.height,
    };

    if (element.type !== ItemContent) {
      element = <ItemContent hash={key}>{element}</ItemContent>;
    }

    const { onResize, ...props } = element.props;

    props.onResize = (size, hash) => {
      this._calculateLayout(attrs.itemIndex, hash, size);

      onResize(size);
    };
    props.getSizeByHash = hash => itemSizeDict[hash];

    if (direction === 'x') {
      if (props.height < 0 && height >= 0) {
        props.height = height;
      }
    } else {
      if (props.width < 0 && width >= 0) {
        props.width = width;
      }
    }

    return (
      <div key={key} style={itemStyle}>
        <ItemContent {...props} />
      </div>
    );
  }

  render() {
    const { itemCount, visibleRect } = this.props;
    const { layoutAttrs } = this.state;
    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutAttrs[itemIndex];

      if (attrs && needsRender(attrs.rect, visibleRect)) {
        items.push(
          this._renderItem(attrs, getItemVisibleRect(attrs.rect, visibleRect))
        );
      }
    }

    return items;
  }
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
    direction === 'x'
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
      rect: {
        [x]: 0,
        [y]: sizeHeight,
        [width]: itemSize[width],
        [height]: itemSize[height],
      },
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
