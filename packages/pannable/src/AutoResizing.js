import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class AutoResizing extends React.Component {
  static defaultProps = {
    children: () => null,
    width: -1,
    height: -1,
  };

  constructor(props) {
    super(props);

    const { width, height } = props;

    this.state = {
      size: { width: width < 0 ? 0 : width, height: height < 0 ? 0 : height },
    };
    this.resizeRef = React.createRef();
  }

  componentDidMount() {
    const { width, height } = this.props;

    if (width < 0 || height < 0) {
      this._calculateSize();
    }
  }
  componentDidUpdate(prevProps) {
    const { width, height } = this.props;

    if (prevProps.width !== width || prevProps.height !== height) {
      if (width < 0 || height < 0) {
        this._calculateSize();
      } else {
        if (this._resizeNode) {
          resizeDetector.uninstall(this._resizeNode);
          this._resizeNode = undefined;
        }
        this.setState({ size: { width, height } });
      }
    }
  }
  componentWillUnmount() {
    if (this._resizeNode) {
      resizeDetector.uninstall(this._resizeNode);
      this._resizeNode = undefined;
    }
  }
  _calculateSize = () => {
    if (!this._resizeNode) {
      const resizeNode = this.resizeRef.current;

      if (!resizeNode) {
        return;
      }

      this._resizeNode = resizeNode;
      resizeDetector.listenTo(resizeNode, this._calculateSize);

      return;
    }

    this.setState({ size: getElementSize(this._resizeNode) });
  };
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
