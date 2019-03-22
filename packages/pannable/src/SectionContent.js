import React from 'react';
import ListContent from './ListContent';

export default class SectionContent extends React.PureComponent {
  static defaultProps = {
    renderHeader: () => null,
    renderBody: () => null,
    renderFooter: () => null,
  };

  state = {
    listVisibleRect: { x: 0, y: 0, width: 0, height: 0 },
  };

  listRef = React.createRef();

  _onListResize(size) {
    this.setState({
      listVisibleRect: { x: 0, y: 0, ...size },
    });

    this.props.onResize(size);
  }

  render() {
    const { renderHeader, renderBody, renderFooter, ...props } = this.props;
    const { listVisibleRect } = this.state;

    return (
      <ListContent
        {...props}
        ref={this.listRef}
        visibleRect={listVisibleRect}
        itemCount={3}
        renderItem={({ itemIndex, rect, visibleRect, Item }) => {
          if (itemIndex === 0) {
            return renderHeader({ rect, Item, visibleRect });
          } else if (itemIndex === 1) {
            return renderBody({ rect, Item, visibleRect });
          } else if (itemIndex === 2) {
            return renderFooter({ rect, Item, visibleRect });
          }
        }}
        onResize={this._onListResize}
      />
    );
  }
}
