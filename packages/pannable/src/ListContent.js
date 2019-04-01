import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';
import ItemContent from './ItemContent';

export default class ListContent extends React.Component {
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

    this.state = {
      size: layout.size,
      layoutList: layout.layoutList,
      itemHashList,
      itemSizeDict,
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
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
      onResize,
    } = this.props;
    const { size } = this.state;

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
    if (prevState.size !== size) {
      onResize(size);
    }
  }

  getSize() {
    return this.state.size;
  }

  getItemRect({ itemIndex }) {
    const { layoutList } = this.state;
    const attrs = layoutList[itemIndex];

    return (attrs && attrs.rect) || null;
  }

  _calculateLayout(changedItem) {
    this.setState((state, props) => {
      const { size, itemHashList, itemSizeDict } = state;
      let nextItemHashList = itemHashList;
      let nextItemSizeDict = itemSizeDict;
      const nextState = {};

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

      nextState.layoutList = layout.layoutList;

      if (nextItemHashList !== itemHashList) {
        nextState.itemHashList = nextItemHashList;
      }
      if (nextItemSizeDict !== itemSizeDict) {
        nextState.itemSizeDict = nextItemSizeDict;
      }
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
    const { direction, width, height, renderItem } = this.props;
    const { itemSizeDict } = this.state;

    const { itemIndex, rect, Item } = layoutAttrs;
    let element = renderItem(layoutAttrs);
    const key = element.key || itemIndex;

    if (element.type !== Item) {
      element = <Item>{element}</Item>;
    }

    const { onResize, ...props } = element.props;
    const itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

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
        <Item {...props} />
      </div>
    );
  }

  render() {
    const {
      direction,
      width,
      height,
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
      renderItem,
      visibleRect,
      onResize,
      ...props
    } = this.props;
    const { size, layoutList } = this.state;

    const elemStyle = {
      position: 'relative',
      width: size ? size.width : 'auto',
      height: size ? size.height : 'auto',
      ...props.style,
    };
    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const attrs = layoutList[itemIndex];
      const layoutAttrs = {
        ...attrs,
        itemIndex,
        visibleRect: getItemVisibleRect(attrs.rect, visibleRect),
        Item: ItemContent,
      };

      if (needsRender(layoutAttrs.rect, visibleRect)) {
        items.push(this._renderItem(layoutAttrs));
      }
    }

    return (
      <div {...props} style={elemStyle}>
        {items}
      </div>
    );
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
  const layoutList = [];

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    if (itemIndex > 0) {
      sizeHeight += spacing;
    }

    const itemHash = itemHashList[itemIndex];
    let itemSize = itemSizeDict[itemHash] || {
      [width]: size[width] || estimatedItemSize[width],
      [height]: estimatedItemSize[height],
    };

    layoutList.push({
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
    layoutList,
  };
}
