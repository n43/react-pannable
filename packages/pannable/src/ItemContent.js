import React from 'react';
import PadContext from './PadContext';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

export default class ItemContent extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    onResize: () => {},
  };

  static contextType = PadContext;

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

  _updateSize() {
    const { size } = this.state;

    if (size) {
      this.context.onContentResize(size);
    } else {
      this.calculateSize();
    }

    this.props.onResize(size, this.resizeRef);
  }

  render() {
    const { width, height, onResize, ...props } = this.props;
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
      element = element(this.state);
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

    return <div {...props} />;
  }
}
