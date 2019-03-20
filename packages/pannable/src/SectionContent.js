import React from 'react';
import ListContent from './ListContent';

export default class SectionContent extends React.PureComponent {
  static defaultProps = {
    renderHeader: () => null,
    renderBody: () => null,
    renderFooter: () => null,
  };

  listRef = React.createRef();

  state = {
    listVisibleRect: { x: 0, y: 0, width: 0, height: 0 },
  };

  _onListResize(size) {
    this.setState({
      listVisibleRect: { x: 0, y: 0, ...size },
    });
  }

  render() {
    const {
      renderHeader,
      renderBody,
      renderFooter,
      visibleRect,
      ...props
    } = this.props;
    const { listVisibleRect } = this.state;

    return (
      <ListContent
        {...props}
        ref={this.listRef}
        visibleRect={listVisibleRect}
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
        onResize={this._onListResize}
      />
    );
  }
}
