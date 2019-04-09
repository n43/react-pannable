import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.Component {
  static defaultProps = {
    shouldCalculateSize: () => true,
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

  getSize() {
    return this.state.size;
  }

  calculateSize() {
    this.setState((state, props) => {
      const { size } = state;
      const { width, height, shouldCalculateSize } = props;

      if (!shouldCalculateSize()) {
        return null;
      }

      let nextSize = size;
      let nextState = null;

      if (typeof width === 'number' && typeof height === 'number') {
        nextSize = { width, height };
      } else {
        nextSize = getElementSize(this.resizeRef.current);
      }

      if (
        !size ||
        nextSize.width !== size.width ||
        nextSize.height !== size.height
      ) {
        nextState = nextState || {};
        nextState.size = nextSize;
      }

      return nextState;
    });
  }

  render() {
    const {
      shouldCalculateSize,
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

    if (!(typeof width === 'number' && typeof height === 'number')) {
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
      props.style = {
        position: 'relative',
        ...props.style,
      };
    }

    if (size) {
      props.style = {
        width: size.width,
        height: size.height,
        ...props.style,
      };
    }
    props.children = element;

    return <div {...props} />;
  }
}
