import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

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
      layoutHash: '',
      size: null,
    };

    this.resizeRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const { width, height } = props;
    const { size, layoutHash } = state;
    let nextState = null;

    const nextLayoutHash = [width, height].join();

    if (nextLayoutHash !== layoutHash) {
      let nextSize = null;

      if (typeof width === 'number' && typeof height === 'number') {
        nextSize = { width, height };
      }

      nextState = nextState || {};

      nextState.layoutHash = nextLayoutHash;

      if (!isEqualToSize(nextSize, size)) {
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
