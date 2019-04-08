import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
    connectWithPad: true,
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
      this._calculateLayout();
    }

    this._attachResizeNode();
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, onResize } = this.props;
    const { size } = this.state;

    if (prevProps.width !== width || prevProps.height !== height) {
      this._calculateLayout();
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

  _attachResizeNode() {
    const resizeNode = this.resizeRef.current;

    if (resizeNode) {
      this._resizeNode = resizeNode;
      resizeDetector.listenTo(resizeNode, () => {
        this._calculateLayout();
      });
    }
  }

  _detachResizeNode() {
    if (this._resizeNode) {
      resizeDetector.uninstall(this._resizeNode);
      this._resizeNode = undefined;
    }
  }

  _calculateLayout() {
    this.setState((state, props) => {
      const { size } = state;
      const { width, height } = props;
      let nextSize = size;
      const nextState = {};

      if (typeof width === 'number' && typeof height === 'number') {
        nextSize = { width, height };
      } else {
        if (this._resizeNode) {
          nextSize = getElementSize(this._resizeNode);
        }
      }

      if (
        !size ||
        nextSize.width !== size.width ||
        nextSize.height !== size.height
      ) {
        nextState.size = nextSize;
      }

      return nextState;
    });
  }

  render() {
    const {
      width,
      height,
      visibleRect,
      onResize,
      connectWithPad,
      ...props
    } = this.props;
    const { size } = this.state;

    let element = props.children;

    if (typeof element === 'function') {
      element = element(this);
    }

    element = (
      <div
        ref={this.resizeRef}
        style={{
          position: 'absolute',
          width: typeof width === 'number' ? width : 'auto',
          height: typeof height === 'number' ? height : 'auto',
        }}
      >
        {element}
      </div>
    );

    props.children = element;
    props.style = {
      position: 'relative',
      width: size ? size.width : 'auto',
      height: size ? size.height : 'auto',
      ...props.style,
    };

    return <div {...props} />;
  }
}
