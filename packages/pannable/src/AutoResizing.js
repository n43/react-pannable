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

  state = {
    layoutHash: '',
    size: null,
  };

  resizeRef = React.createRef();

  static getDerivedStateFromProps(props, state) {
    const { width, height } = props;
    const { size, layoutHash } = state;
    let nextState = null;

    const nextLayoutHash = [width, height].join();

    if (nextLayoutHash !== layoutHash) {
      nextState = nextState || {};
      nextState.layoutHash = nextLayoutHash;

      let nextSize = null;

      if (typeof width === 'number' && typeof height === 'number') {
        nextSize = { width, height };
      }

      if (!isEqualToSize(nextSize, size)) {
        nextState.size = nextSize;
      }
    }

    return nextState;
  }

  componentDidMount() {
    this._updateSize();
  }

  componentDidUpdate(prevProps, prevState) {
    const { size } = this.state;

    if (size !== prevState.size) {
      this._updateSize();
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
      const { size } = state;
      const nextSize = getElementSize(this.resizeRef.current);

      if (isEqualToSize(nextSize, size)) {
        return null;
      }

      return { size: nextSize };
    });
  }

  _updateSize() {
    const { width, height } = this.props;
    const { size } = this.state;

    if (!size) {
      this.calculateSize();
      return;
    }

    if (typeof width === 'number' && typeof height === 'number') {
      this._detachResizeNode();
    } else {
      if (!this._resizeNode) {
        this._attachResizeNode(this.resizeRef.current);
      }
    }

    this.props.onResize(size);
  }

  _attachResizeNode(resizeNode) {
    this._resizeNode = resizeNode;
    resizeDetector.listenTo(resizeNode, () => this.calculateSize());
  }

  _detachResizeNode() {
    if (this._resizeNode) {
      resizeDetector.uninstall(this._resizeNode);
      this._resizeNode = undefined;
    }
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
