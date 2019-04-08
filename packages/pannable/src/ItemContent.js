import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.Component {
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

  getSize() {
    return this.state.size;
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
        const resizeNode = this.resizeRef.current;

        if (resizeNode) {
          nextSize = getElementSize(resizeNode);
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
