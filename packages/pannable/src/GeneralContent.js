import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import createDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = {
    children: () => null,
    content: null,
    fixedWidth: 0,
    fixedHeight: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      contentSize: { width: props.fixedWidth, height: props.fixedHeight },
    };
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    const { fixedWidth, fixedHeight } = this.props;

    if (!(fixedWidth && fixedHeight)) {
      this.resizeDetector = createDetector();
      this._computeSize().then(({ error }) => {
        if (!error) {
          const contentNode = this.contentRef.current;
          this.resizeDetector.addResizeListener(contentNode, () => {
            this._computeSize();
          });
        }
      });
    }
  }
  componentDidUpdate(prevProps) {
    const { fixedWidth, fixedHeight } = this.props;

    if (
      prevProps.fixedWidth !== fixedWidth ||
      prevProps.fixedHeight !== fixedHeight
    ) {
      if (fixedWidth && fixedHeight) {
        this.setState({
          contentSize: { width: fixedWidth, height: fixedHeight },
        });
      } else {
        this._computeSize().then(({ error }) => {
          if (!error && !this.resizeDetector) {
            const contentNode = this.contentRef.current;
            this.resizeDetector.addResizeListener(contentNode, () => {
              this._computeSize();
            });
          }
        });
      }
    }
  }
  componentWillUnmount() {
    if (this.resizeDetector) {
      const contentNode = this.contentRef.current;
      this.resizeDetector.removeResizeListener(contentNode);
    }
  }
  _computeSize = () => {
    return new Promise(resolve => {
      const { fixedWidth, fixedHeight } = this.props;
      const contentNode = this.contentRef.current;

      if (fixedWidth && fixedHeight) {
        resolve({ error: 1 });
        return;
      }

      const size = getElementSize(contentNode, !fixedWidth, !fixedHeight);

      this.setState(
        {
          contentSize: { width: fixedWidth, height: fixedHeight, ...size },
        },
        () => resolve({ error: 0 })
      );
    });
  };
  render() {
    const { content, children } = this.props;
    const { contentSize } = this.state;

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
      contentWidth: contentSize.width,
      contentHeight: contentSize.height,
    });
  }
}
