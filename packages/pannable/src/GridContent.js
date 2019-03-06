import React from 'react';

export default class GridContent extends React.Component {
  static defaultProps = {
    columnCount: 0,
    rowCount: 0,
    columnWidth: 0,
    rowHeight: 0,
    rowHash: ({ rowIndex }) => rowIndex,
    columnHash: ({ columnIndex }) => columnIndex,
    renderCell: () => null,
    cellKey: ({ columnIndex, rowIndex }) => rowIndex + '-' + columnIndex,
    visibleRect: { x: 0, y: 0, width: 0, height: 0 },
    onResize: () => {},
  };

  state = {
    size: { width: 0, height: 0 },
    columnHashDict: {},
    rowHashDict: {},
    xList: [],
    yList: [],
  };

  static getDerivedStateFromProps(props, state) {
    const {
      columnWidth,
      rowHeight,
      columnCount,
      rowCount,
      rowHash,
      columnHash,
      onResize,
    } = props;
    const { xList, yList, columnHashDict, rowHashDict, size } = state;
    let nextState = {};
    let nextSize = { ...size };

    const rowState = calculateDerivedState(
      rowCount,
      rowHeight,
      rowHash,
      yList,
      rowHashDict
    );
    if (rowState.xList) {
      nextState.yList = rowState.xList;
    }
    if (rowState.hashDict) {
      nextState.rowHashDict = rowState.hashDict;
    }
    nextSize.height = rowState.width;

    const columnState = calculateDerivedState(
      columnCount,
      columnWidth,
      columnHash,
      xList,
      columnHashDict
    );
    if (columnState.xList) {
      nextState.xList = columnState.xList;
    }
    if (columnState.hashDict) {
      nextState.columnHashDict = columnState.hashDict;
    }
    nextSize.width = columnState.width;

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

function needsRender(pos, size, vPos, vSize, name) {
  if (name) {
    const dPos = pos - vPos;

    return -0.25 * vSize < dPos + size && dPos < 1.25 * vSize;
  }

  return (
    needsRender(pos.x, size.width, vPos.x, vSize.width, 'x') &&
    needsRender(pos.y, size.height, vPos.y, vSize.height, 'y')
  );
}

function calculateDerivedState(count, widthFn, hash, xList, hashDict) {
  let shouldUpdateXList = xList.length !== count;
  let nextXList = [];
  let nextWidth = 0;
  let nextHashDict;
  let nextState = {};

  for (let index = 0; index < count; index++) {
    let width;

    if (typeof widthFn === 'number') {
      width = widthFn;
    } else {
      const hashKey = hash({ index });
      width = hashDict[hashKey];

      if (width === undefined) {
        width = widthFn({ index });

        if (!nextHashDict) {
          nextHashDict = { ...hashDict };
        }
        nextHashDict[hashKey] = width;
      }
    }

    nextWidth += width;

    if (xList[index] !== nextWidth) {
      shouldUpdateXList = true;
    }
    nextXList[index] = nextWidth;
  }

  if (shouldUpdateXList) {
    nextState.xList = nextXList;
  }
  if (nextHashDict) {
    nextState.hashDict = nextHashDict;
  }
  nextState.width = nextWidth;

  return nextState;
}
