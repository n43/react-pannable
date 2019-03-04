import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class AutoResizing extends React.Component {
  static defaultProps = {
    children: () => null,
    width: -1,
    height: -1,
  };

  state = {
    size: { width: 0, height: 0 },
  };

  resizeRef = React.createRef();

  componentDidMount() {
    this._calculateSize();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this._calculateSize();
    }
  }

  componentWillUnmount() {
    if (this._resizeNode) {
      resizeDetector.uninstall(this._resizeNode);
      this._resizeNode = undefined;
    }
  }

  _calculateSize() {
    const { width, height } = this.props;
    let size;

    if (width < 0 || height < 0) {
      if (!this._resizeNode) {
        const resizeNode = this.resizeRef.current;

        if (!resizeNode) {
          return;
        }

        this._resizeNode = resizeNode;
        resizeDetector.listenTo(resizeNode, () => this._calculateSize());

        return;
      }

      size = getElementSize(this._resizeNode);
    } else {
      if (this._resizeNode) {
        resizeDetector.uninstall(this._resizeNode);
        this._resizeNode = undefined;
      }

      size = { width, height };
    }

    this.setState({ size });
  }

  render() {
    const { width, height, children } = this.props;
    const style = {
      width: width < 0 ? '100%' : width,
      height: height < 0 ? '100%' : height,
    };

    return (
      <div ref={this.resizeRef} style={style}>
        {children(this.state.size)}
      </div>
    );
  }
}
