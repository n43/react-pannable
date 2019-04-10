import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import { isEqualSize } from './utils/geometry';

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

    const layout = calculateLayout(props);

    this.state = { size: layout.size };

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

      if (!props.shouldCalculateSize()) {
        return null;
      }

      let nextState = null;
      let nextSize = null;
      const layout = calculateLayout(props);

      nextSize = layout.size;

      if (!nextSize) {
        nextSize = getElementSize(this.resizeRef.current);
      }

      if (!isEqualSize(nextSize, size)) {
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

    if (!size) {
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

function calculateLayout(props) {
  const { width, height } = props;
  let size = null;

  if (typeof width === 'number' && typeof height === 'number') {
    size = { width, height };
  }

  return { size };
}
