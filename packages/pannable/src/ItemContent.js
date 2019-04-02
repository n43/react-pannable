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
  }

  componentDidMount() {
    const { size, sizeHash } = this.state;

    if (size) {
      this.props.onResize(size, sizeHash);
    } else {
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
      onResize(size, sizeHash);
    }
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const { size } = state;
      const nextState = {};

      const layout = calculateLayout(props);

      nextState.sizeHash = layout.hash;

      if (!layout.size) {
        const resizeNode = this.resizeRef.current;

        if (resizeNode) {
          layout.size = getElementSize(resizeNode);
        }
      }
      if (
        !size ||
        layout.size.width !== size.width ||
        layout.size.height !== size.height
      ) {
        nextState.size = layout.size;
      }

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

    if (React.isValidElement(element)) {
      if (element.props.onResize) {
        const Resizable = element.type;

        element = (
          <Resizable
            {...element.props}
            onResize={size => {
              this.setState({
                sizeHash: 'size:' + size.width + ',' + size.height,
                size,
              });
              element.props.onResize(size);
            }}
          />
        );
      }
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
