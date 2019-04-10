import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';
import { isEqualSize } from './utils/geometry';
import ItemContent from './ItemContent';

function Item() {}

export default class ListContent extends React.Component {
  static defaultProps = {
    direction: 'y',
    width: null,
    height: null,
    spacing: 0,
    itemCount: 0,
    estimatedItemWidth: 0,
    estimatedItemHeight: 0,
    renderItem: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
    connectWithPad: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      size: null,
      layoutList: [],
      itemHashDict: {},
      itemSizeDict: {},
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { itemCount } = props;
    const { size, layoutList, itemHashDict, itemSizeDict } = state;
    let nextState = null;

    if (itemCount !== layoutList.length) {
      const layout = calculateLayout(props, itemHashDict, itemSizeDict);

      nextState = nextState || {};
      nextState.layoutList = layout.layoutList;

      if (!isEqualSize(layout.size, size)) {
        nextState.size = layout.size;
      }
    }

    return nextState;
  }

  componentDidMount() {
    const { size } = this.state;

    if (size) {
      this.props.onResize(size);
    } else {
      this.calculateSize();
    }

    this._updateItemHashDict();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      direction,
      width,
      height,
      spacing,
      estimatedItemWidth,
      estimatedItemHeight,
      onResize,
    } = this.props;
    const { size, itemHashDict, itemSizeDict } = this.state;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.spacing !== spacing ||
      prevProps.estimatedItemWidth !== estimatedItemWidth ||
      prevProps.estimatedItemHeight !== estimatedItemHeight ||
      prevState.itemHashDict !== itemHashDict ||
      prevState.itemSizeDict !== itemSizeDict
    ) {
      this.calculateSize();
    }
    if (prevState.size !== size) {
      onResize(size);
    }

    this._updateItemHashDict();
  }

  getSize() {
    return this.state.size;
  }

  getItemRect({ itemIndex }) {
    const { layoutList } = this.state;
    const attrs = layoutList[itemIndex];

    return (attrs && attrs.rect) || null;
  }

  calculateSize() {
    this.setState((state, props) => {
      const { size, itemHashDict, itemSizeDict } = state;
      const nextState = {};

      const layout = calculateLayout(props, itemHashDict, itemSizeDict);

      nextState.layoutList = layout.layoutList;

      if (!isEqualSize(layout.size, size)) {
        nextState.size = layout.size;
      }

      return nextState;
    });
  }

  _updateItemHashDict() {
    if (this._itemHashDict) {
      const itemHashDict = this._itemHashDict;
      this._itemHashDict = null;

      this.setState(state => ({
        itemHashDict: { ...state.itemHashDict, ...itemHashDict },
      }));
    }
  }

  _renderItem(layoutAttrs) {
    const { direction, width, height, renderItem } = this.props;
    const { itemHashDict, itemSizeDict } = this.state;

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
    let hash;
    let key;

    if (React.isValidElement(element) && element.type === Item) {
      if (element.props.style) {
        itemStyle = { ...itemStyle, ...element.props.style };
      }
      forceRender = element.props.forceRender;
      hash = element.props.hash;
      key = element.key;

      element = element.props.children;
    }

    if (!key) {
      key = '' + itemIndex;
    }
    if (hash === undefined) {
      hash = key;
    }

    if (itemHashDict[itemIndex] !== hash) {
      if (!this._itemHashDict) {
        this._itemHashDict = {};
      }
      this._itemHashDict[itemIndex] = hash;
    }

    if (!forceRender && !needsRender) {
      return null;
    }

    if (!React.isValidElement(element) || !element.props.connectWithPad) {
      element = <ItemContent>{element}</ItemContent>;
    }
    if (element.props.style) {
      itemStyle = { ...itemStyle, ...element.props.style };
    }

    const onResize = element.props.onResize;
    const elemProps = {
      key,
      ref: element.ref,
      style: itemStyle,
      visibleRect,
      onResize: size => {
        this.setState(state => ({
          itemSizeDict: {
            ...state.itemSizeDict,
            [hash]: size,
          },
        }));

        onResize(size);
      },
    };

    const itemSize = itemSizeDict[hash];

    if (itemSize) {
      if (typeof element.props.width !== 'number') {
        elemProps.width = itemSize.width;
      }
      if (typeof element.props.height !== 'number') {
        elemProps.height = itemSize.height;
      }
    } else {
      if (direction === 'x') {
        if (
          typeof element.props.height !== 'number' &&
          typeof height === 'number'
        ) {
          elemProps.height = height;
        }
      } else {
        if (
          typeof element.props.width !== 'number' &&
          typeof width === 'number'
        ) {
          elemProps.width = width;
        }
      }
    }

    return React.cloneElement(element, elemProps);
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
      connectWithPad,
      ...props
    } = this.props;
    const { size, layoutList } = this.state;

    const elemStyle = { position: 'relative', boxSizing: 'border-box' };

    if (size) {
      elemStyle.width = size.width;
      elemStyle.height = size.height;
    }

    props.style = {
      ...elemStyle,
      ...props.style,
    };

    const items = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
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

    props.children = items;

    return <div {...props} />;
  }
}

function calculateLayout(props, itemHashDict, itemSizeDict) {
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
    const itemHash = itemHashDict[itemIndex];
    let itemSize = itemSizeDict[itemHash] || {
      [width]:
        typeof size[width] === 'number'
          ? size[width]
          : estimatedItemSize[width],
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

    if (itemSize[height] > 0) {
      sizeHeight += itemSize[height];

      if (itemIndex < itemCount - 1) {
        sizeHeight += spacing;
      }
    }
    if (sizeWidth < itemSize[width]) {
      sizeWidth = itemSize[width];
    }
  }

  return {
    size: { [width]: sizeWidth, [height]: sizeHeight },
    layoutList,
  };
}
