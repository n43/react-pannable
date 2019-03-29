import React from 'react';
import ListContent from './ListContent';

export default class SectionContent extends React.Component {
  static defaultProps = {
    renderHeader: () => null,
    renderBody: () => null,
    renderFooter: () => null,
  };

  constructor(props) {
    super(props);

    this.listRef = React.createRef();
  }

  render() {
    const { renderHeader, renderBody, renderFooter, ...props } = this.props;

    return (
      <ListContent
        {...props}
        ref={this.listRef}
        itemCount={3}
        renderItem={({ itemIndex, rect, visibleRect, Item }) => {
          if (itemIndex === 0) {
            return renderHeader({ rect, visibleRect, Item });
          } else if (itemIndex === 1) {
            return renderBody({ rect, visibleRect, Item });
          } else if (itemIndex === 2) {
            return renderFooter({ rect, visibleRect, Item });
          }
        }}
      />
    );
  }
}
