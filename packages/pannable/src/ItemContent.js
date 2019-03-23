import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.PureComponent {
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

    if (layout.size) {
      props.onResize(layout.size, layout.hash);
    }
    this.state = { size: layout.size };

    this.resizeRef = React.createRef();
  }

  componentDidMount() {
    if (!this.state.size) {
      this._calculateLayout();
    }
  }

  componentDidUpdate(prevProps) {
    const { width, height, hash } = this.props;

    if (
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.hash !== hash
    ) {
      this._calculateLayout();
    }
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const { onResize } = props;
      const { size } = state;
      const layout = calculateLayout(props);

      if (!layout.size) {
        const resizeNode = this.resizeRef.current;
        layout.size = getElementSize(resizeNode);
      }

      if (
        size &&
        layout.size.width === size.width &&
        layout.size.height === size.height
      ) {
        return null;
      }

      onResize(layout.size, layout.hash);
      return { size: layout.size };
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

function calculateLayout(props) {
  const { width, height, hash, getSizeByHash } = props;

  if (typeof width === 'number' && typeof height === 'number') {
    return { hash: 'size:' + width + ',' + height, size: { width, height } };
  }

  return { hash, size: getSizeByHash(hash) || null };
}
