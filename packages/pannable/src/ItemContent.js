import React from 'react';
import { getElementSize } from './utils/sizeGetter';

export default class ItemContent extends React.Component {
  static defaultProps = {
    width: null,
    height: null,
    hash: '',
    onResize: () => {},
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
    const { width, height, hash, onResize } = this.props;
    const { size } = this.state;

    if (
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.hash !== hash
    ) {
      this._calculateLayout();
    }
    if (prevState.size !== size) {
      onResize(size);
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
        const resizeNode = this.resizeRef.current;

        if (resizeNode) {
          nextSize = getElementSize(resizeNode);
        }
      }

      if (nextSize !== size) {
        nextState.size = nextSize;
      }

      return nextState;
    });
  }

  render() {
    const { width, height, hash, onResize, ...props } = this.props;
    const { size } = this.state;

    let element = props.children;

    if (typeof element === 'function') {
      element = element(this);
    }
    if (React.isValidElement(element) && element.props.onResize) {
      element = React.cloneElement(element, {
        onResize: size => {
          this.setState({ size });
          element.props.onResize(size);
        },
      });
    } else {
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
    props.style = {
      position: 'relative',
      width: size ? size.width : 'auto',
      height: size ? size.height : 'auto',
      ...props.style,
    };

    return <div {...props} />;
  }
}
