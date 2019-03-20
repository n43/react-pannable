import React from 'react';
import ListContent from './ListContent';

export default class SectionContent extends React.PureComponent {
  static defaultProps = {
    renderHeader: () => null,
    renderBody: () => null,
    renderFooter: () => null,
  };

  listRef = React.createRef();

  render() {
    const {
      renderHeader,
      renderBody,
      renderFooter,
      visibleRect,
      ...props
    } = this.props;
    const list = this.listRef.current;
    let listRect = visibleRect;

    if (list) {
      listRect = { x: 0, y: 0, ...list.state.size };
    }

    return (
      <ListContent
        {...props}
        ref={this.listRef}
        visibleRect={listRect}
        itemCount={3}
        renderItem={({ itemIndex, rect, Item }) => {
          if (itemIndex === 0) {
            return renderHeader({ rect, Item });
          } else if (itemIndex === 1) {
            return renderBody({ rect, Item });
          } else if (itemIndex === 2) {
            return renderFooter({ rect, Item });
          }
        }}
      />
    );
  }
}
