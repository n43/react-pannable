import React from 'react';
// import { getItemVisibleRect } from './utils/visible';
// import ItemContent from './ItemContent';

export default class SectionContent extends React.Component {
  static defaultProps = {
    direction: 'y',
    width: 0,
    height: 0,
    renderHeader: () => null,
    renderBody: () => null,
    renderFooter: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const itemSizeDict = {};
    const layout = calculateLayout(props, itemSizeDict);

    this.state = {
      size: layout.size,
      layoutDict: layout.layoutDict,
      itemSizeDict,
    };

    props.onResize(layout.size);
  }

  componentDidUpdate(prevProps, prevState) {
    const { direction, width, height, onResize } = this.props;
    const { size } = this.state;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.height !== height
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

  getItemRect({ name }) {
    const { layoutDict } = this.state;
    const attrs = layoutDict[name];

    return (attrs && attrs.rect) || null;
  }

  render() {
    const {
      direction,
      width,
      height,
      renderHeader,
      renderBody,
      renderFooter,
      visibleRect,
      onResize,
      ...props
    } = this.props;

    return null;
  }
}

function calculateLayout(props) {}
