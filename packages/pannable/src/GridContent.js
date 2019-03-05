import React from 'react';

function calculateDerivedState(count, widthFn, hash, widthList, hashDict) {
  let shouldUpdateWidthList = widthList.length !== count;
  let nextWidthList = [];
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
    if (widthList[index] !== width) {
      shouldUpdateWidthList = true;
    }

    nextWidthList[index] = width;
    nextWidth += width;
  }
  if (shouldUpdateWidthList) {
    nextState.widthList = nextWidthList;
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
    widthList: [],
    heightList: [],
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
    const { widthList, heightList, columnHashDict, rowHashDict, size } = state;
    let nextState = {};
    let nextSize = { ...size };

    const rowState = calculateDerivedState(
      rowCount,
      rowHeight,
      rowHash,
      heightList,
      rowHashDict
    );
    if (rowState.widthList) {
      nextState.heightList = rowState.widthList;
    }
    if (rowState.hashDict) {
      nextState.rowHashDict = rowState.hashDict;
    }
    nextSize.height = rowState.width;

    const columnState = calculateDerivedState(
      columnCount,
      columnWidth,
      columnHash,
      widthList,
      columnHashDict
    );
    if (columnState.widthList) {
      nextState.widthList = columnState.widthList;
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

  render() {
    const { renderCell, cellKey } = this.props;
    const { widthList, heightList } = this.state;
    const grids = [];
    let top = 0;

    for (let rowIndex in heightList) {
      let left = 0;

      for (let columnIndex in widthList) {
        grids.push(
          renderCell({
            columnIndex,
            rowIndex,
            key: cellKey({ columnIndex, rowIndex }),
            style: {
              position: 'absolute',
              top,
              left,
              width: widthList[columnIndex],
              height: heightList[rowIndex],
            },
          })
        );

        left += widthList[columnIndex];
      }

      top += heightList[rowIndex];
    }

    return <React.Fragment>{grids}</React.Fragment>;
  }
}
