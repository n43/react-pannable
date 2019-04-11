import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import { isEqualSize } from './utils/geometry';

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

      if (width !== prevWidth) {
        nextState.prevWidth = width;
      }
      if (height !== prevHeight) {
        nextState.prevHeight = height;
      }
      if (!isEqualSize(nextSize, size)) {
        nextState.size = nextSize;
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
  }

  componentDidUpdate(prevProps, prevState) {
    const { size } = this.state;

    if (size !== prevState.size) {
      if (size) {
        this.props.onResize(size);
      } else {
        this.calculateSize();
      }
    }
  }

  getSize() {
    return this.state.size;
  }

  calculateSize() {
    const resizeNode = this.resizeRef.current;

    if (resizeNode) {
      return;
    }

    this.setState(state => {
      const { size } = state;
      const nextSize = getElementSize(resizeNode);

      if (isEqualSize(nextSize, size)) {
        return null;
      }

      return { size: nextSize };
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

    const elemStyle = { position: 'relative' };

    if (size) {
      elemStyle.width = size.width;
      elemStyle.height = size.height;
    }

    props.style = {
      ...elemStyle,
      ...props.style,
    };

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
    }

    props.children = element;

    return <div {...props} />;
  }
}
