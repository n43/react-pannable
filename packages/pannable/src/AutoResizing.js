import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';
import { isEqualToSize } from './utils/geometry';

export default class AutoResizing extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    onResize: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      size: null,
      prevWidth: null,
      prevHeight: null,
    };

    this.resizeRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const { width, height } = props;
    const { size, prevWidth, prevHeight } = state;
    let nextState = null;

    if (width !== prevWidth || height !== prevHeight) {
      let nextSize = null;

      if (typeof width === 'number' && typeof height === 'number') {
        nextSize = { width, height };
      }

      nextState = nextState || {};

      if (!isEqualToSize(nextSize, size)) {
        nextState.size = nextSize;
      }
      if (width !== prevWidth) {
        nextState.prevWidth = width;
      }
      if (height !== prevHeight) {
        nextState.prevHeight = height;
      }
    }

    return nextState;
  }

  componentDidMount() {
    const { size } = this.state;

    if (size) {
      this.props.onResize(size);
    } else {
      this.calculateSize();
    }

    this._checkResizeNode();
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, onResize } = this.props;
    const { size } = this.state;

    if (width !== prevProps.width || height !== prevProps.height) {
      this._checkResizeNode();
    }
    if (size !== prevState.size) {
      if (size) {
        onResize(size);
      } else {
        this.calculateSize();
      }
    }
  }

  componentWillUnmount() {
    this._detachResizeNode();
  }

  getSize() {
    return this.state.size;
  }

  calculateSize() {
    this.setState(state => {
      const resizeNode = this.resizeRef.current;

      if (!resizeNode) {
        return null;
      }

      const { size } = state;
      const nextSize = getElementSize(resizeNode);

      if (isEqualToSize(nextSize, size)) {
        return null;
      }

      return { size: nextSize };
    });
  }

  _checkResizeNode() {
    const { width, height } = this.props;

    if (typeof width === 'number' && typeof height === 'number') {
      this._detachResizeNode();
    } else {
      this._attachResizeNode(this.resizeRef.current);
    }
  }

  _attachResizeNode(resizeNode) {
    if (this._resizeNode) {
      return;
    }

    this._resizeNode = resizeNode;
    resizeDetector.listenTo(resizeNode, () => this.calculateSize());
  }

  _detachResizeNode() {
    if (!this._resizeNode) {
      return;
    }

    resizeDetector.uninstall(this._resizeNode);
    this._resizeNode = undefined;
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
