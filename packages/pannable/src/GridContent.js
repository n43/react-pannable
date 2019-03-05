import React from 'react';

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

export default class GridContent extends React.Component {
  static defaultProps = {
    pad: null,
    cellKey: ({ columnIndex, rowIndex }) => rowIndex + '-' + columnIndex,
    rowHash: ({ rowIndex }) => rowIndex,
    columnHash: ({ columnIndex }) => columnIndex,
    columnWidth: 0,
    rowHeight: 0,
    columnCount: 0,
    rowCount: 0,
    renderCell: () => null,
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
      pad,
      columnWidth,
      rowHeight,
      columnCount,
      rowCount,
      rowHash,
      columnHash,
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
      pad.setContentSize(nextSize);
      nextState.size = nextSize;
    }

    return nextState;
  }

  _needsRenderCell({ x, y, width, height }) {
    const { pad } = this.props;
    const contentOffset = pad.getContentOffset();
    const boundingSize = pad.getSize();
    const dx = x + contentOffset.x;
    const dy = y + contentOffset.y;

    return (
      -0.25 * boundingSize.width < dx + width &&
      dx < 1.25 * boundingSize.width &&
      -0.25 * boundingSize.height < dy + height &&
      dy < 1.25 * boundingSize.height
    );
  }

  render() {
    const { renderCell, cellKey } = this.props;
    const { xList, yList } = this.state;
    const grids = [];

    for (let rowIndex = 0; rowIndex < yList.length; rowIndex++) {
      for (let columnIndex = 0; columnIndex < xList.length; columnIndex++) {
        const x = columnIndex === 0 ? 0 : xList[columnIndex - 1];
        const y = rowIndex === 0 ? 0 : yList[rowIndex - 1];
        const width = xList[columnIndex] - x;
        const height = yList[rowIndex] - y;

        if (this._needsRenderCell({ x, y, width, height })) {
          const cellStyle = {
            position: 'absolute',
            left: x,
            top: y,
            width,
            height,
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
