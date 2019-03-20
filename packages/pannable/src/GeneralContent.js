import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.PureComponent {
  static defaultProps = {
    width: -1,
    height: -1,
    onResize: () => {},
  };

  resizeRef = React.createRef();

  componentDidMount() {
    this._calculateSize();
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
    const { width, height, onResize } = this.props;
    let size;

    if (width < 0 || height < 0) {
      if (!this._resizeNode) {
        const resizeNode = this.resizeRef.current;

        if (!resizeNode) {
          return;
        }

        this._resizeNode = resizeNode;
        resizeDetector.listenTo(resizeNode, () => this._calculateSize());

        return;
      }

      size = getElementSize(this._resizeNode);
    } else {
      if (this._resizeNode) {
        resizeDetector.uninstall(this._resizeNode);
        this._resizeNode = undefined;
      }

      size = { width, height };
    }

    onResize(size);
  }

  render() {
    const { width, height, onResize, style, children, ...props } = this.props;
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
