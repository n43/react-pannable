import React from 'react';
import StyleSheet from './utils/StyleSheet';
import { getElementSize } from './utils/sizeGetter';

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
    this.computeSize();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.fixedWidth !== this.props.fixedWidth) {
      this.computeSize();
    }
    if (prevProps.fixedHeight !== this.props.fixedHeight) {
      this.computeSize();
    }
  }
  computeSize = () => {
    const { fixedWidth, fixedHeight } = this.props;
    const element = this.contentRef.current;

    if (!fixedWidth && !fixedHeight) {
      return;
    }

    if (fixedWidth && fixedHeight) {
      return;
    }

    const size = getElementSize(element, !fixedWidth, !fixedHeight);
    console.log('computed size:', size);
    this.setState(({ contentSize }) => {
      return {
        contentSize: {
          ...contentSize,
          ...size,
        },
      };
    });
  };
  render() {
    const { content, fixedWidth, fixedHeight, children } = this.props;
    const { contentSize } = this.state;

    const sizerStyle = StyleSheet.create({
      position: 'absolute',
      top: 0,
      left: 0,
      width: fixedWidth,
      height: fixedHeight,
      overflow: 'auto',
    });

    const contentWidth = fixedWidth || contentSize.width;
    const contentHeight = fixedHeight || contentSize.height;

    return (
      <React.Fragment>
        {children({ content, contentWidth, contentHeight })}
        <div style={sizerStyle}>
          <div ref={this.contentRef}>{content}</div>
        </div>
      </React.Fragment>
    );
  }
}
