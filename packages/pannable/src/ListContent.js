import React from 'react';
import BaseContent from './BaseContent';
import { getItemVisibleRect, needsRender } from './utils/visible';
import { isEqualSize } from './utils/geometry';
import ItemContent from './ItemContent';

function Item() {}

export default class ListContent extends React.Component {
  static defaultProps = {
    ...BaseContent.defaultProps,
    direction: 'y',
    spacing: 0,
    itemCount: 0,
    estimatedItemWidth: 0,
    estimatedItemHeight: 0,
    renderItem: () => null,
  };

  constructor(props) {
    super(props);

    this._itemHashList = [];
    this._itemSizeDict = {};
    this._invalidLayout = false;

    this.state = calculateLayout(props, this._itemHashList, this._itemSizeDict);
  }

  componentDidMount() {
    const { size } = this.state;

    if (size) {
      this.props.onResize(size);
    }

    if (this._invalidLayout) {
      this._layout();
    }
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
      direction !== prevProps.direction ||
      width !== prevProps.width ||
      height !== prevProps.height ||
      spacing !== prevProps.spacing ||
      itemCount !== prevProps.itemCount ||
      estimatedItemWidth !== prevProps.estimatedItemWidth ||
      estimatedItemHeight !== prevProps.estimatedItemHeight
    ) {
      this._invalidLayout = true;
    }
    if (prevState.size !== size) {
      if (size) {
        onResize(size);
      }
    }

    if (this._invalidLayout) {
      this._layout();
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

  _layout() {
    this._invalidLayout = false;

    this.setState((state, props) => {
      const { size } = state;
      const nextState = {};

      const layout = calculateLayout(
        props,
        this._itemHashList,
        this._itemSizeDict
      );

      nextState.fixed = layout.fixed;
      nextState.layoutList = layout.layoutList;

      if (!isEqualSize(layout.size, size)) {
        nextState.size = layout.size;
      }

      return nextState;
    });
  }

  _renderItem(layoutAttrs) {
    const { renderItem } = this.props;
    const { fixed } = this.state;

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

    if (hash !== this._itemHashList[itemIndex]) {
      this._invalidLayout = true;
      this._itemHashList[itemIndex] = hash;
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

    const onItemResize = element.props.onResize;
    const elemProps = {
      key,
      ref: element.ref,
      style: itemStyle,
      visibleRect,
      onResize: size => {
        if (!isEqualSize(size, this._itemSizeDict[hash])) {
          this._itemSizeDict[hash] = size;
          this._layout();
        }

        onItemResize(size);
      },
    };

    const itemSize = this._itemSizeDict[hash];

    if (itemSize) {
      elemProps.width = itemSize.width;
      elemProps.height = itemSize.height;
    } else {
      if (
        typeof fixed.height === 'number' &&
        typeof element.props.height !== 'number'
      ) {
        elemProps.height = fixed.height;
      }
      if (
        typeof fixed.width === 'number' &&
        typeof element.props.width !== 'number'
      ) {
        elemProps.width = fixed.width;
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

    props.children = items;

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
  const fixed = {};

  if (typeof size[width] === 'number') {
    fixed[width] = size[width];
  }

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const itemHash = itemHashList[itemIndex];
    let itemSize = itemSizeDict[itemHash] || {
      [width]:
        fixed[width] === undefined ? estimatedItemSize[width] : fixed[width],
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
    fixed,
    layoutList,
  };
}
