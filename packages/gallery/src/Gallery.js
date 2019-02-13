import React from 'react';
import { Grid } from 'react-virtualized/dist/es/Grid';

class Gallery extends React.Component {
  render() {
    const { direction, inset, renderer, ...gridProps } = this.props;

    if (direction === 'column') {
      gridProps.columnWidth = gridProps.width;
      gridProps.rowHeight = gridProps.height - inset;
      gridProps.columnCount = 1;
      gridProps.rowCount = gridProps.count;
      gridProps.cellRenderer = props => {
        props.index = props.rowIndex;
        return renderer(props);
      };
    } else {
      gridProps.columnWidth = gridProps.width - inset;
      gridProps.rowHeight = gridProps.height;
      gridProps.columnCount = gridProps.count;
      gridProps.rowCount = 1;
      gridProps.cellRenderer = props => {
        props.index = props.columnIndex;
        return renderer(props);
      };
    }

    return <Grid {...gridProps} />;
  }
}

Gallery.defaultProps = {
  direction: 'row',
  inset: 0,
  renderer: () => null,
};

export default Gallery;
