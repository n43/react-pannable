import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';
import { isEqualSize } from './utils/geometry';

export default class AutoResizing extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    const { width, height } = props;
    let size = null;

    if (typeof width === 'number' && typeof height === 'number') {
      size = { width, height };
    }

    this.state = { size };
    this.resizeRef = React.createRef();
  }

  componentDidMount() {
    const { size } = this.state;

    if (size) {
      this.props.onResize(size);
    } else {
      this.calculateSize();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, onResize } = this.props;
    const { size } = this.state;

    if (prevProps.width !== width || prevProps.height !== height) {
      this.calculateSize();
    }
    if (prevState.size !== size) {
      onResize(size);
    }
  }

  componentWillUnmount() {
    this._detachResizeNode();
  }

  getSize() {
    return this.state.size;
  }

  calculateSize() {
    this.setState((state, props) => {
      const { size } = state;
      const { width, height } = props;

      let nextSize = size;
      let nextState = null;

      if (typeof width === 'number' && typeof height === 'number') {
        this._detachResizeNode();

        nextSize = { width, height };
      } else {
        if (this._attachResizeNode()) {
          return null;
        }

        nextSize = getElementSize(this._resizeNode);
      }

      if (!isEqualSize(nextSize, size)) {
        nextState = nextState || {};
        nextState.size = nextSize;
      }

      return nextState;
    });
  }

  _attachResizeNode() {
    const resizeNode = this.resizeRef.current;

    if (!resizeNode || this._resizeNode) {
      return false;
    }

    this._resizeNode = resizeNode;
    resizeDetector.listenTo(resizeNode, () => this.calculateSize());

    return true;
  }

  _detachResizeNode() {
    if (!this._resizeNode) {
      return false;
    }

    resizeDetector.uninstall(this._resizeNode);
    this._resizeNode = undefined;

    return true;
  }

  render() {
    const { width, height, onResize, ...props } = this.props;
    const { size } = this.state;

    let element = props.children;

    if (size) {
      if (typeof element === 'function') {
        element = element(size);
      }
    } else {
      element = null;
    }

    props.children = element;
    props.style = {
      width: typeof width === 'number' ? width : '100%',
      height: typeof height === 'number' ? height : '100%',
      ...props.style,
    };

    return <div {...props} ref={this.resizeRef} />;
  }
}
