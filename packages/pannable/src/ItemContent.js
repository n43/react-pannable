import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    hash: '',
    getSizeByHash: () => null,
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const layout = calculateLayout(props);

    this.state = { size: layout.size, sizeHash: layout.hash };
    this.resizeRef = React.createRef();

    if (layout.size) {
      props.onResize(layout.size, layout.hash);
    }
  }

  componentDidMount() {
    if (!this.state.size) {
      this._calculateLayout();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, hash, onResize } = this.props;
    const { size, sizeHash } = this.state;

    if (
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.hash !== hash
    ) {
      this._calculateLayout();
    }
    if (prevState.size !== size) {
      console.log('ItemzContent:', size, sizeHash);
      onResize(size, sizeHash);
    }
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const { size } = state;
      const nextState = {};

      const layout = calculateLayout(props);

      nextState.sizeHash = layout.hash;
      console.log('_calculateLayout size:', layout.size);
      if (!layout.size) {
        const resizeNode = this.resizeRef.current;
        layout.size = getElementSize(resizeNode);
        console.log('_calculateLayout size2:', layout.size);
      }
      if (
        !size ||
        layout.size.width !== size.width ||
        layout.size.height !== size.height
      ) {
        nextState.size = layout.size;
      }
      console.log('_calculateLayout:', props, nextState);
      return nextState;
    });
  }

  render() {
    const {
      width,
      height,
      hash,
      getSizeByHash,
      onResize,
      ...props
    } = this.props;

    const elemStyle = {
      position: 'absolute',
      width: typeof width === 'number' ? width : 'auto',
      height: typeof height === 'number' ? height : 'auto',
      ...props.style,
    };
    let element = props.children;

    if (typeof element === 'function') {
      element = element(this);
    }

    return (
      <div {...props} ref={this.resizeRef} style={elemStyle}>
        {element}
      </div>
    );
  }
}

function calculateLayout(props) {
  const { width, height, hash, getSizeByHash } = props;

  if (typeof width === 'number' && typeof height === 'number') {
    return { hash: 'size:' + width + ',' + height, size: { width, height } };
  }

  return { hash, size: getSizeByHash(hash) || null };
}
