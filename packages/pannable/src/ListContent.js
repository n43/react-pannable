import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';
import ItemContent from './ItemContent';

export default class ListContent extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    width: 0,
    height: 0,
    spacing: 0,
    itemCount: 0,
    estimatedItemWidth: 0,
    estimatedItemHeight: 0,
    renderItem: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const itemHashList = [];
    const itemSizeDict = {};
    const layout = calculateLayout(props, itemHashList, itemSizeDict);

    props.onResize(layout.size);

    this.state = {
      size: layout.size,
      layoutAttrs: layout.layoutAttrs,
      itemHashList,
      itemSizeDict,
    };
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

  _calculateLayout(changedItem) {
    this.setState((state, props) => {
      const { itemHashList, itemSizeDict } = state;
      const nextState = {};
      let nextItemHashList = itemHashList;
      let nextItemSizeDict = itemSizeDict;
      if (changedItem) {
        const { itemIndex, itemHash, itemSize } = changedItem;

        if (nextItemHashList[itemIndex] === itemHash) {
          return null;
        }

        nextItemHashList = [...nextItemHashList];
        nextItemHashList[itemIndex] = itemHash;
        nextItemSizeDict = { ...nextItemSizeDict, [itemHash]: itemSize };
      }

      const layout = calculateLayout(props, nextItemHashList, nextItemSizeDict);

      nextState.layoutAttrs = layout.layoutAttrs;

      if (nextItemHashList !== itemHashList) {
        nextState.itemHashList = nextItemHashList;
      }
      if (nextItemSizeDict !== itemSizeDict) {
        nextState.itemSizeDict = nextItemSizeDict;
      }
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
    const { direction, width, height, renderItem } = this.props;
    const { itemSizeDict } = this.state;

    let element = renderItem({
      ...attrs,
      itemIndex,
      visibleRect,
      Item: ItemContent,
    });
    const key = element.key || itemIndex;
    const itemStyle = {
      position: 'absolute',
      left: attrs.rect.x,
      top: attrs.rect.y,
      width: attrs.rect.width,
      height: attrs.rect.height,
    };

    if (element.type !== ItemContent) {
      element = <ItemContent>{element}</ItemContent>;
    }

    const { onResize, ...props } = element.props;

    if (props.hash === '') {
      props.hash = key;
    }

    props.onResize = (itemSize, itemHash) => {
      this._calculateLayout({ itemIndex, itemHash, itemSize });

      onResize(itemSize, itemHash);
    };
    props.getSizeByHash = hash => itemSizeDict[hash];

    if (direction === 'x') {
      if (typeof props.height !== 'number' && height) {
        props.height = height;
      }
    } else {
      if (typeof props.width !== 'number' && width) {
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

function calculateLayout(props, itemHashList, itemSizeDict) {
  const { direction, spacing, itemCount } = props;
  const size = { width: props.width, height: props.height };
  const estimatedItemSize = {
    width: props.estimatedItemWidth,
    height: props.estimatedItemHeight,
  };

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
    let itemSize = itemSizeDict[itemHash] || {
      [width]: size[width] || estimatedItemSize[width],
      [height]: estimatedItemSize[height],
    };

    layoutAttrs.push({
      rect: {
        [x]: 0,
        [y]: sizeHeight,
        [width]: itemSize[width],
        [height]: itemSize[height],
      },
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
