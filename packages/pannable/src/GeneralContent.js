import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
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

    this.state = { size };
    this.resizeRef = React.createRef();

    if (size) {
      onResize(size);
    }
  }

  componentDidMount() {
    if (!this.state.size) {
      this._calculateSize();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, onResize } = this.props;
    const { size } = this.state;

    if (prevProps.width !== width || prevProps.height !== height) {
      this._calculateSize();
    }
    if (prevState.size !== size) {
      onResize(size);
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
      const { width, height } = props;
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

      return { size: nextSize };
    });
  }

  render() {
    const { width, height, onResize, ...props } = this.props;
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
