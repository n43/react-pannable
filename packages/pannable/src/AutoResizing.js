import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class AutoResizing extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const { width, height, onResize } = props;
    let size = null;

    if (typeof width === 'number' && typeof height === 'number') {
      size = { width, height };
    }

    if (size) {
      onResize(size);
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
    const { width, height } = this.props;

    if (prevProps.width !== width || prevProps.height !== height) {
      this._calculateSize();
    }
  }

  componentWillUnmount() {
    if (this._resizeNode) {
      resizeDetector.uninstall(this._resizeNode);
      this._resizeNode = undefined;
    }
  }

  _calculateSize() {
    this.setState((state, props) => {
      const { width, height, onResize } = props;
      const { size } = state;
      let nextSize;

      if (typeof width === 'number' && typeof height === 'number') {
        if (this._resizeNode) {
          resizeDetector.uninstall(this._resizeNode);
          this._resizeNode = undefined;
        }

        nextSize = { width, height };
      } else {
        if (!this._resizeNode) {
          const resizeNode = this.resizeRef.current;

          this._resizeNode = resizeNode;
          resizeDetector.listenTo(resizeNode, () => this._calculateSize());

          return null;
        }

        nextSize = getElementSize(this._resizeNode);
      }

      if (
        size &&
        nextSize.width === size.width &&
        nextSize.height === size.height
      ) {
        return null;
      }

      onResize(nextSize);
      return { size: nextSize };
    });
  }

  render() {
    const { width, height, onResize, style, children, ...props } = this.props;
    const { size } = this.state;
    const elemStyle = {
      width: typeof width === 'number' ? width : '100%',
      height: typeof height === 'number' ? height : '100%',
      ...style,
    };

    return (
      <div {...props} ref={this.resizeRef} style={elemStyle}>
        {typeof children === 'function' ? size && children(size) : children}
      </div>
    );
  }
}
