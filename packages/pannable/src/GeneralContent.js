import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import createResizeDetector from 'element-resize-detector';

export default class GeneralContent extends React.Component {
  static defaultProps = {
    content: null,
    fixedWidth: 0,
    fixedHeight: 0,
  };

  state = {
    contentSize: { width: 0, height: 0 },
  };

  contentRef = React.createRef();

  componentDidMount() {
    this.resizeDetector = createResizeDetector({
      strategy: 'scroll',
    });

    this.computeSize().then(() => {
      const contentNode = this.contentRef.current;

      this.resizeDetector.listenTo(contentNode, () => {
        this.computeSize();
      });
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.fixedWidth !== this.props.fixedWidth) {
      this.computeSize();
    }
    if (prevProps.fixedHeight !== this.props.fixedHeight) {
      this.computeSize();
    }
  }
  componentWillUnmount() {
    const contentNode = this.contentRef.current;
    this.resizeDetector.uninstall(contentNode);
  }
  computeSize = () => {
    return new Promise(resolve => {
      const { fixedWidth, fixedHeight } = this.props;
      const contentNode = this.contentRef.current;

      if (fixedWidth && fixedHeight) {
        return;
      }

      const size = getElementSize(contentNode, !fixedWidth, !fixedHeight);

      this.setState(({ contentSize }) => {
        return {
          contentSize: { ...contentSize, ...size },
        };
      }, resolve);
    });
  };
  render() {
    const { content, fixedWidth, fixedHeight, children } = this.props;
    const { contentSize } = this.state;

    const contentWidth = fixedWidth || contentSize.width;
    const contentHeight = fixedHeight || contentSize.height;

    const wrappedContent = (
      <div
        ref={this.contentRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {content}
      </div>
    );

    return children({ content: wrappedContent, contentWidth, contentHeight });
  }
}
