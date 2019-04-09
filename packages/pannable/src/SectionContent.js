import React from 'react';
// import { getItemVisibleRect } from './utils/visible';
// import ItemContent from './ItemContent';

export default class SectionContent extends React.Component {
  static defaultProps = {
    direction: 'y',
    width: null,
    height: null,
    renderHeader: () => null,
    renderBody: () => null,
    renderFooter: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
    connectWithPad: true,
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
    const { direction, width, height, onResize } = this.props;
    const { size } = this.state;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.height !== height
    ) {
      this.calculateSize();
    }
    if (prevState.size !== size) {
      onResize(size);
    }
  }

  getSize() {
    return this.state.size;
  }

  getItemRect({ itemName }) {
    const { layoutList } = this.state;
    const itemIndex = this._getItemIndexByName(itemName);
    const attrs = layoutList[itemIndex];

    return (attrs && attrs.rect) || null;
  }

  _getItemIndexByName(itemName) {
    return ['header', 'body', 'footer'].indexOf(itemName);
  }

  calculateSize(changedItem) {
    this.setState((state, props) => {
      const { size, itemHashList, itemSizeDict } = state;
      let nextItemHashList = itemHashList;
      let nextItemSizeDict = itemSizeDict;
      const nextState = {};

      if (changedItem) {
        const { itemIndex, itemHash, itemSize } = changedItem;
        const hashItemSize = nextItemSizeDict[itemHash];

        if (nextItemHashList[itemIndex] !== itemHash) {
          nextItemHashList = [...nextItemHashList];
          nextItemHashList[itemIndex] = itemHash;
        }
        if (
          !hashItemSize ||
          hashItemSize.width !== itemSize.width ||
          hashItemSize.height !== itemSize.height
        ) {
          nextItemSizeDict = { ...nextItemSizeDict, [itemHash]: itemSize };
        }
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

  render() {
    // const {
    //   direction,
    //   width,
    //   height,
    //   renderHeader,
    //   renderBody,
    //   renderFooter,
    //   visibleRect,
    //   onResize,
    //   connectWithPad,
    //   ...props
    // } = this.props;

    return null;
  }
}

function calculateLayout(props, itemHashList, itemSizeDict) {}
