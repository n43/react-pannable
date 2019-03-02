import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = {
    children: () => null,
    content: null,
    width: -1,
    height: -1,
  };

  constructor(props) {
    super(props);

    const { width, height } = props;

    this.state = {
      size: { width: width < 0 ? 0 : width, height: height < 0 ? 0 : height },
    };
    this.contentRef = React.createRef();
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
    const { width, height } = this.props;
    const resizeNode = this.contentRef.current;

    if (!this._resizeNode) {
      this._resizeNode = resizeNode;
      resizeDetector.listenTo(resizeNode, this._calculateSize);
      return;
    }

    const resizeNodeSize = getElementSize(resizeNode);

    this.setState({
      size: {
        width: width < 0 ? resizeNodeSize.width : width,
        height: height < 0 ? resizeNodeSize.height : height,
      },
    });
  };
  render() {
    const { content, children } = this.props;
    const { size } = this.state;

    const wrappedContent = (
      <div
        key="content"
        ref={this.contentRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {content}
      </div>
    );

    return children({
      content: wrappedContent,
      width: size.width,
      height: size.height,
    });
  }
}
