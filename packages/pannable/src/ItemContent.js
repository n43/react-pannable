import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.PureComponent {
  static defaultProps = {
    width: 'auto',
    height: 'auto',
    hash: 'Item',
    getSizeByHash: () => null,
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const size = calculateSize(props);

    if (size) {
      props.onResize(size);
    }
    this.state = { size };

    this.resizeRef = React.createRef();
  }

  componentDidMount() {
    if (!this.state.size) {
      this._calculateSize();
    }
  }

  componentDidUpdate(prevProps) {
    const { width, height, hash } = this.props;

    if (
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.hash !== hash
    ) {
      this._calculateSize();
    }
  }

  _calculateSize() {
    this.setState((state, props) => {
      const { hash, onResize } = props;
      const { size } = state;
      let nextSize = calculateSize(props);

      if (!nextSize) {
        const resizeNode = this.resizeRef.current;
        nextSize = getElementSize(resizeNode);
      }

      if (
        size &&
        nextSize.width === size.width &&
        nextSize.height === size.height
      ) {
        return null;
      }

      onResize(nextSize, hash);
      return { size: nextSize };
    });
  }

  render() {
    const {
      width,
      height,
      hash,
      getSizeByHash,
      onResize,
      style,
      children,
      ...props
    } = this.props;
    const elemStyle = {
      position: 'absolute',
      width: typeof width === 'number' ? width : 'auto',
      height: typeof height === 'number' ? height : 'auto',
      ...style,
    };

    return (
      <div {...props} ref={this.resizeRef} style={elemStyle}>
        {typeof children === 'function' ? children(this) : children}
      </div>
    );
  }
}

function calculateSize(props) {
  const { width, height, hash, getSizeByHash } = props;

  if (typeof width === 'number' && typeof height === 'number') {
    return { width, height };
  }

  return getSizeByHash(hash) || null;
}
