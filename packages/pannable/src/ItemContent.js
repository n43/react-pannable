import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.PureComponent {
  static defaultProps = {
    width: -1,
    height: -1,
    hash: 'Item',
    getSizeByHash: () => null,
    onResize: () => {},
  };

  resizeRef = React.createRef();

  componentDidMount() {
    this._calculateSize();
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
    const { width, height, hash, getSizeByHash, onResize } = this.props;

    let size;

    if (width < 0 || height < 0) {
      size = getSizeByHash(hash) || getElementSize(this.resizeRef.current);
    } else {
      size = { width, height };
    }

    onResize(size, hash);
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
      width: width < 0 ? 'auto' : width,
      height: height < 0 ? 'auto' : height,
      ...style,
    };

    return (
      <div {...props} ref={this.resizeRef} style={elemStyle}>
        {typeof children === 'function' ? children(this) : children}
      </div>
    );
  }
}
