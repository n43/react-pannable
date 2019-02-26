import React from 'react';
import { getElementSize } from './utils/sizeGetter';
import StyleSheet from './utils/StyleSheet';

export default class GeneralContent extends React.Component {
  static defaultProps = {
    content: null,
    fixedWidth: 0,
    fixedHeight: 0,
  };

  computeSize = () => {
    const { fixedWidth, fixedHeight } = this.props;
  };
  render() {
    const { content, children } = this.props;
    const sizerStyle = StyleSheet.create({
      position: 'absolute',
      top: 0,
      left: 0,
    });

    return (
      <React.Fragment>
        {children({ content, contentWidth: 400, contentHeight: 1920 })}
        <div style={sizerStyle}>{content}</div>
      </React.Fragment>
    );
  }
}
