import React from 'react';
import PadContext from './PadContext';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

export default class ItemContent extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
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
      const { size } = state;
      const nextSize = getElementSize(this.resizeRef.current);

      if (isEqualToSize(nextSize, size)) {
        return null;
      }

      return { size: nextSize };
    });
  }

  _updateSize() {
    const { size } = this.state;

    if (!size) {
      this.calculateSize();
      return;
    }

    this.context.onContentResize(size);
  }

  _onResize = () => {};

  render() {
    const { width, height, ...props } = this.props;
    const { size } = this.state;

    const elemStyle = { position: 'relative' };
    const resizeStyle = { position: 'absolute' };

    if (typeof width === 'number') {
      resizeStyle.width = width;
    }
    if (typeof height === 'number') {
      resizeStyle.height = height;
    }

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

    return (
      <PadContext.Provider
        value={{ ...this.context, onContentResize: this._onResize }}
      >
        <div {...props}>
          <div ref={this.resizeRef} style={resizeStyle}>
            {element}
          </div>
        </div>
      </PadContext.Provider>
    );
  }
}
