import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import createElementResizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = {
    children: () => null,
    content: null,
    width: 0,
    height: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      width: props.width,
      height: props.height,
    };
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    const { width, height } = this.props;

    if (!(width && height)) {
      this._calculateSize();
    }
  }
  componentDidUpdate(prevProps) {
    const { width, height } = this.props;

    if (prevProps.width !== width || prevProps.height !== height) {
      if (width && height) {
        this.setState({ width, heigh });
      } else {
        this._calculateSize();
      }
    }
  }
  componentWillUnmount() {
    if (this.resizeDetector) {
      const contentNode = this.contentRef.current;
      this.resizeDetector.removeResizeListener(contentNode);
    }
  }
  _calculateSize = () => {
    const { width, height } = this.props;
    const contentNode = this.contentRef.current;

    if (width && height) {
      return;
    }

    const size = getElementSize(contentNode);
    this.setState(
      {
        width: width || size.width,
        height: height || size.height,
      },
      () => {
        if (!this.resizeDetector) {
          this.resizeDetector = createElementResizeDetector();
          this.resizeDetector.addResizeListener(
            contentNode,
            this._calculateSize
          );
        }
      }
    );
  };
  render() {
    const { content, children } = this.props;
    const { width, height } = this.state;

    const wrappedContent = (
      <div
        ref={this.contentRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {content}
      </div>
    );

    return children({
      content: wrappedContent,
      width,
      height,
    });
  }
}
