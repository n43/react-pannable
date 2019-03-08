import React from 'react';

export default class GridContent extends React.PureComponent {
  static defaultProps = {
    rowCount: 0,
    columnCount: 0,
    rowHeight: 0,
    columnWidth: 0,
    rowHeightHash: ({ rowIndex }) => '' + rowIndex,
    columnWidthHash: ({ columnIndex }) => '' + columnIndex,
    cellKey: ({ columnIndex, rowIndex }) => rowIndex + '-' + columnIndex,
    renderCell: () => null,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  state = {
    size: { width: 0, height: 0 },
    widthDict: {},
    heightDict: {},
    xList: [],
    yList: [],
  };

  static getDerivedStateFromProps(props, state) {
    const {
      columnWidth,
      rowHeight,
      columnCount,
      rowCount,
      rowHeightHash,
      columnWidthHash,
      onResize,
    } = props;
    const { xList, yList, widthDict, heightDict, size } = state;
    let nextState = {};
    let nextSize = { ...size };

    const rowState = calculateDerivedState(
      rowCount,
      rowHeight,
      rowHeightHash,
      yList,
      heightDict
    );
    if (rowState.originList) {
      nextState.yList = rowState.originList;
    }
    if (rowState.sizeDict) {
      nextState.heightDict = rowState.sizeDict;
    }
    nextSize.height = rowState.size;

    const columnState = calculateDerivedState(
      columnCount,
      columnWidth,
      columnWidthHash,
      xList,
      widthDict
    );
    if (columnState.originList) {
      nextState.xList = columnState.originList;
    }
    if (columnState.sizeDict) {
      nextState.widthDict = columnState.sizeDict;
    }
    nextSize.width = columnState.size;

    if (nextSize.width !== size.width || nextSize.height !== size.height) {
      onResize(nextSize);
      nextState.size = nextSize;
    }

    return nextState;
  }

  getCellRect({ rowIndex, columnIndex }) {
    const { xList, yList } = this.state;
    const x = xList[columnIndex - 1] || 0;
    const y = yList[rowIndex - 1] || 0;
    const x2 = xList[columnIndex] || 0;
    const y2 = yList[rowIndex] || 0;

    return { x, y, width: x2 - x, height: y2 - y };
  }

  render() {
    const { visibleRect, renderCell, cellKey, children } = this.props;

    if (typeof children === 'function') {
      return children(this);
    }

    const { xList, yList } = this.state;
    const grids = [];

    for (let rowIndex = 0; rowIndex < yList.length; rowIndex++) {
      for (let columnIndex = 0; columnIndex < xList.length; columnIndex++) {
        const cellRect = this.getCellRect({ rowIndex, columnIndex });

        if (
          needsRender(
            { x: cellRect.x, y: cellRect.y },
            { width: cellRect.width, height: cellRect.height },
            { x: visibleRect.x, y: visibleRect.y },
            { width: visibleRect.width, height: visibleRect.height }
          )
        ) {
          const cellStyle = {
            position: 'absolute',
            left: cellRect.x,
            top: cellRect.y,
            width: cellRect.width,
            height: cellRect.width,
          };

          grids.push(
            <div key={cellKey({ columnIndex, rowIndex })} style={cellStyle}>
              {renderCell({ columnIndex, rowIndex })}
            </div>
          );
        }
      }
    }

    return <React.Fragment>{grids}</React.Fragment>;
  }
}

function needsRender(origin, size, vOrigin, vSize, name) {
  if (name) {
    const dOrigin = origin - vOrigin;

    return -0.25 * vSize < dOrigin + size && dOrigin < 1.25 * vSize;
  }

  return (
    needsRender(origin.x, size.width, vOrigin.x, vSize.width, 'x') &&
    needsRender(origin.y, size.height, vOrigin.y, vSize.height, 'y')
  );
}

function calculateDerivedState(
  count,
  sizeFn,
  sizeHashFn,
  originList,
  sizeDict
) {
  let shouldUpdateOriginList = originList.length !== count;
  let nextOriginList = [];
  let nextSize = 0;
  let nextSizeDict;
  let nextState = {};

  for (let index = 0; index < count; index++) {
    let size;

    if (typeof sizeFn === 'number') {
      size = sizeFn;
    } else {
      const sizeHash = sizeHashFn({ index });
      size = sizeDict[sizeHash];

      if (size === undefined) {
        size = sizeFn({ index });

        if (!nextSizeDict) {
          nextSizeDict = { ...sizeDict };
        }
        nextSizeDict[sizeHash] = size;
      }
    }

    nextSize += size;

    if (originList[index] !== nextSize) {
      shouldUpdateOriginList = true;
    }
    nextOriginList[index] = nextSize;
  }

  if (shouldUpdateOriginList) {
    nextState.originList = nextOriginList;
  }
  if (nextSizeDict) {
    nextState.sizeDict = nextSizeDict;
  }
  nextState.size = nextSize;

  return nextState;
}
