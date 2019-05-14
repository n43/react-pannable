import React from 'react';
import PadContext from './PadContext';
import ItemContent from './ItemContent';
import { getItemVisibleRect, needsRender } from './utils/visible';
import { isEqualToSize } from './utils/geometry';

function Item() {}

export default class ListContent extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    direction: 'y',
    spacing: 0,
    itemCount: 0,
    estimatedItemWidth: 0,
    estimatedItemHeight: 0,
    renderItem: () => null,
  };

  static contextType = PadContext;

  state = {
    layoutHash: '',
    size: null,
    fixed: null,
    layoutList: null,
    itemHashList: [],
    itemSizeDict: {},
  };

  static getDerivedStateFromProps(props, state) {
    const {
      direction,
      width,
      height,
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
    } = props;
    const { size, layoutHash, itemHashList, itemSizeDict } = state;
    let nextState = null;

    const itemSizeList = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const itemHash = itemHashList[itemIndex];
      const itemSize = itemSizeDict[itemHash];

      itemSizeList[itemIndex] = itemSize
        ? itemSize.width + '-' + itemSize.height
        : '';
    }

    const nextLayoutHash = [
      direction,
      width,
      height,
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
      itemSizeList.join('_'),
    ].join();

    if (nextLayoutHash !== layoutHash) {
      const layout = calculateLayout(props, itemHashList, itemSizeDict);

      nextState = nextState || {};

      nextState.layoutHash = nextLayoutHash;
      nextState.fixed = layout.fixed;
      nextState.layoutList = layout.layoutList;

      if (!isEqualToSize(layout.size, size)) {
        nextState.size = layout.size;
      }
    }

    return nextState;
  }

  componentDidMount() {
    const { size, itemHashList } = this.state;

    if (size) {
      this.context.onContentResize(size);
    }
    if (this._itemHashList.join() !== itemHashList.join()) {
      this.setState({ itemHashList: this._itemHashList });
    }
    this._itemHashList = undefined;
  }

  componentDidUpdate(prevProps, prevState) {
    const { size, itemHashList } = this.state;

    if (size !== prevState.size) {
      if (size) {
        this.context.onContentResize(size);
      }
    }
    if (this._itemHashList.join() !== itemHashList.join()) {
      this.setState({ itemHashList: this._itemHashList });
    }
    this._itemHashList = undefined;
  }

  getSize() {
    return this.state.size;
  }

  getItemRect({ itemIndex }) {
    const { layoutList } = this.state;
    const attrs = layoutList[itemIndex];

    return (attrs && attrs.rect) || null;
  }

  _renderItem(layoutAttrs) {
    const { renderItem } = this.props;
    const { fixed, itemSizeDict } = this.state;

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

    let shouldRender = !forceRender && !needsRender;
    const itemSize = itemSizeDict[hash];

    if (!itemSize && this._itemHashList.indexOf(hash) !== -1) {
      shouldRender = false;
    }

    this._itemHashList[itemIndex] = hash;

    if (shouldRender) {
      return null;
    }

    if (
      !React.isValidElement(element) ||
      element.type.contextType !== PadContext
    ) {
      element = <ItemContent>{element}</ItemContent>;
    }

    if (element.props.style) {
      itemStyle = { ...itemStyle, ...element.props.style };
    }

    const elemProps = {
      ref: element.ref,
      style: itemStyle,
    };

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

    element = React.cloneElement(element, elemProps);

    return (
      <PadContext.Provider
        key={key}
        value={{
          ...this.context,
          visibleRect,
          onContentResize: size => {
            this.setState(({ itemSizeDict }) => {
              if (isEqualToSize(size, itemSizeDict[hash])) {
                return null;
              }

              return { itemSizeDict: { ...itemSizeDict, [hash]: size } };
            });
          },
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
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
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

    this._itemHashList = [];
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
