import React from 'react';
import { Grid } from 'react-virtualized/dist/es/Grid';

class Gallery extends React.Component {
  static defaultProps = {
    direction: 'row',
    inset: 0,
    renderer: () => null,
  };

  cellRenderer = ({
    parent,
    rowIndex,
    columnIndex,
    style,
    isScrolling,
    isVisible,
    key,
  }) => {
    const { direction, renderer } = this.props;
    let index;

    if (direction === 'column') {
      index = rowIndex;
    } else {
      index = columnIndex;
    }

    return renderer({ index, parent, style, isScrolling, isVisible, key });
  };

  render() {
    const { direction, inset, renderer, ...gridProps } = this.props;
    const wrapperStyle = {
      overflow: 'hidden',
      width: gridProps.width,
      height: gridProps.height,
    };

    if (direction === 'column') {
      gridProps.columnWidth = gridProps.width;
      gridProps.rowHeight = gridProps.height - 2 * inset;
      gridProps.columnCount = 1;
      gridProps.rowCount = gridProps.count;
      gridProps.width += 30;
    } else {
      gridProps.columnWidth = gridProps.width - 2 * inset;
      gridProps.rowHeight = gridProps.height;
      gridProps.columnCount = gridProps.count;
      gridProps.rowCount = 1;
      gridProps.height += 30;
    }

    gridProps.cellRenderer = this.cellRenderer;

    return (
      <div style={wrapperStyle}>
        <Grid {...gridProps} />
      </div>
    );
  }
}

export default Gallery;
