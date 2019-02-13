import React from 'react';
import { Grid } from 'react-virtualized/dist/es/Grid';
import clsx from 'clsx';

export default class Gallery extends React.Component {
  render() {
    const { className, ...gridProps } = this.props;
    const classNames = clsx('ReactVirtualizedGallery__Gallery', className);
    return <Grid {...gridProps} className={classNames} />;
  }
}
