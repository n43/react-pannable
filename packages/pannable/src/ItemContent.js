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

  state = {
    size: { width: 0, height: 0 },
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
    this.setState((state, props) => {
      const { width, height, hash, getSizeByHash, onResize } = props;
      const { size } = state;
      let nextSize;

      if (width >= 0 && height >= 0) {
        nextSize = { width, height };
      } else {
        const resizeNode = this.resizeRef.current;

        nextSize = getSizeByHash(hash) || getElementSize(resizeNode);
      }

      if (nextSize.width !== size.width || nextSize.height !== size.height) {
        onResize(nextSize, hash);
      }

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
      width: width >= 0 ? width : 'auto',
      height: height >= 0 ? height : 'auto',
      ...style,
    };

    return (
      <div {...props} ref={this.resizeRef} style={elemStyle}>
        {typeof children === 'function' ? children(this) : children}
      </div>
    );
  }
}
