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

    const layout = calculateLayout(props);

    this.state = { size: layout.size };
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
      const nextState = {};

      const layout = calculateLayout(props);

      if (!layout.size) {
        const resizeNode = this.resizeRef.current;

        if (resizeNode) {
          layout.size = getElementSize(resizeNode);
        }
      }
      if (
        !size ||
        layout.size.width !== size.width ||
        layout.size.height !== size.height
      ) {
        nextState.size = layout.size;
      }

      return nextState;
    });
  }

  render() {
    const { width, height, hash, onResize, ...props } = this.props;
    const { size } = this.state;

    const elemStyle = {
      position: 'relative',
      width: size ? size.width : 'auto',
      height: size ? size.height : 'auto',
      ...props.style,
    };
    let element = props.children;

    if (typeof element === 'function') {
      element = element(this);
    }

    if (React.isValidElement(element) && element.props.onResize) {
      const Resizable = element.type;

      element = (
        <Resizable
          {...element.props}
          onResize={size => {
            this.setState({ size });
            element.props.onResize(size);
          }}
        />
      );
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

    return (
      <div {...props} style={elemStyle}>
        {element}
      </div>
    );
  }
}

function calculateLayout(props) {
  const { width, height } = props;

  if (typeof width === 'number' && typeof height === 'number') {
    return { size: { width, height } };
  }

  return { size: null };
}
