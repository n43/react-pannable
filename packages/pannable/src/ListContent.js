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
    itemHashDict: {},
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
        width,
        height,
        spacing,
        itemCount,
        estimatedItemWidth,
        estimatedItemHeight,
        onResize,
      } = props;
      const { itemHashList, itemHashDict } = state;

      const nextState = calculateLayout(
        { width: estimatedItemWidth, height: estimatedItemHeight },
        itemHashList,
        itemHashDict,
        itemCount,
        spacing,
        { width, height },
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

function needsRender() {}

function calculateLayout(
  itemSize,
  itemHashList,
  itemHashDict,
  itemCount,
  spacing,
  size,
  direction
) {
  if (!direction) {
  } else if (direction === 'vertical') {
    return calculateLayout(
      itemSize,
      itemHashList,
      itemHashDict,
      itemCount,
      spacing,
      size
    );
  } else if (direction === 'horizontal') {
  }
}
