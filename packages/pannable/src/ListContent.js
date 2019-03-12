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
    itemKey: attrs => attrs.itemIndex,
    renderItem: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  state = {
    itemSizeHash: {},
    size: { width: 0, height: 0 },
    layoutAttrs: [],
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
      // const {
      //   direction,
      //   width,
      //   height,
      //   spacing,
      //   itemCount,
      //   estimatedItemWidth,
      //   estimatedItemHeight,
      //   onResize,
      // } = props;
      // const nextState = calculateLayout(
      //   { width: estimatedItemWidth, height: estimatedItemHeight },
      //   itemCount,
      //   spacing,
      //   { width, height },
      //   direction
      // );
      // if (
      //   state.size.width !== nextState.size.width ||
      //   state.size.height !== nextState.size.height
      // ) {
      //   onResize(nextState.size);
      // }
      // return nextState;
    });
  }
}
