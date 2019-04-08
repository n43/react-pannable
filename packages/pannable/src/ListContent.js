import React from 'react';
import { getItemVisibleRect, needsRender } from './utils/visible';
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

    this._itemHashList = [];
    this._itemSizeDict = {};
    const layout = calculateLayout(
      props,
      this._itemHashList,
      this._itemSizeDict
    );

    this.state = {
      size: layout.size,
      layoutList: layout.layoutList,
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

  _calculateLayout() {
    this.setState((state, props) => {
      const { size } = state;
      const nextState = {};

      const layout = calculateLayout(
        props,
        this._itemHashList,
        this._itemSizeDict
      );

      nextState.layoutList = layout.layoutList;

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

    const { itemIndex, rect, visibleRect, needsRender, Item } = layoutAttrs;
    let element = renderItem(layoutAttrs);
    let forceRender;
    let hash;
    let key = '' + itemIndex;
    let style = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    if (React.isValidElement(element) && element.type === Item) {
      forceRender = element.props.forceRender;
      hash = element.props.hash;

      if (element.props.style) {
        style = { ...style, ...element.props.style };
      }
      if (element.key) {
        key = element.key;
      }

      element = element.props.children;
    }

    if (!React.isValidElement(element)) {
      element = <ItemContent>{element}</ItemContent>;
    }

    if (!element.props.connectWithPad) {
      if (element.key) {
        key = element.key;
      }

      element = <ItemContent>{element}</ItemContent>;
    }

    if (hash === undefined) {
      hash = key;
    }

    this._itemHashList[itemIndex] = hash;

    if (!forceRender && !needsRender) {
      return null;
    }

    style = {
      ...style,
      ...element.props.style,
    };

    const onResize = element.props.onResize;
    const elemProps = {
      key,
      ref: element.ref,
      style,
      visibleRect,
      onResize: size => {
        this._itemSizeDict[hash] = size;
        this._calculateLayout();

        onResize(size);
      },
    };

    const size = this._itemSizeDict[hash];

    if (size) {
      if (typeof elemProps.width !== 'number') {
        elemProps.width = size.width;
      }
      if (typeof elemProps.height !== 'number') {
        elemProps.height = size.height;
      }
    }
    if (direction === 'x') {
      if (typeof elemProps.height !== 'number' && typeof height === 'number') {
        elemProps.height = height;
      }
    } else {
      if (typeof elemProps.width !== 'number' && typeof width === 'number') {
        elemProps.width = width;
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
    props.style = {
      position: 'relative',
      width: size.width,
      height: size.height,
      ...props.style,
    };

    return <div {...props} />;
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
    const itemHash = itemHashList[itemIndex];
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
