import React from 'react';

export default class GridContent extends React.Component {
  static defaultProps = {
    cellKey: ({ columnIndex, rowIndex }) => rowIndex + '-' + columnIndex,
    rowHash: ({ rowIndex }) => rowIndex,
    columnHash: ({ columnIndex }) => columnIndex,
    columnWidth: 0,
    rowHeight: 0,
    columnCount: 0,
    rowCount: 0,
    renderCell: () => null,
    onResize: () => {},
  };

  state = {
    rowHashDict: {},
    columnHashDict: {},
    widthList: [],
    heightList: [],
    size: { width: 0, height: 0 },
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
    const { widthList, heightList, rowHashDict, columnHashDict, size } = state;
    let shouldUpdateHeightList = heightList.length !== rowCount;
    let shouldUpdateWidthList = widthList.length !== columnCount;
    const nextHeightList = [];
    const nextWidthList = [];
    let nextRowHashDict;
    let nextColumnHashDict;
    const nextSize = { width: 0, height: 0 };
    let nextState = {};

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const hashKey = rowHash({ rowIndex });
      let height = rowHashDict[hashKey];

      if (height === undefined) {
        height =
          typeof rowHeight === 'function' ? rowHeight({ rowIndex }) : rowHeight;

        if (!nextRowHashDict) {
          nextRowHashDict = { ...rowHashDict };
        }
        nextRowHashDict[hashKey] = height;
      }
      if (heightList[rowIndex] !== height) {
        shouldUpdateHeightList = true;
      }

      nextHeightList[rowIndex] = height;
      nextSize.height += height;
    }
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const hashKey = columnHash({ columnIndex });
      let width = columnHashDict[hashKey];

      if (width === undefined) {
        width =
          typeof columnWidth === 'function'
            ? columnWidth({ columnIndex })
            : columnWidth;

        if (!nextColumnHashDict) {
          nextColumnHashDict = { ...columnHashDict };
        }
        nextColumnHashDict[hashKey] = width;
      }
      if (widthList[columnIndex] !== width) {
        shouldUpdateWidthList = true;
      }

      nextWidthList[columnIndex] = width;
      nextSize.width += width;
    }

    if (shouldUpdateHeightList) {
      nextState.heightList = nextHeightList;
    }
    if (shouldUpdateWidthList) {
      nextState.widthList = nextWidthList;
    }
    if (nextRowHashDict) {
      nextState.rowHashDict = nextRowHashDict;
    }
    if (nextColumnHashDict) {
      nextState.columnHashDict = nextColumnHashDict;
    }
    if (nextSize.width !== size.width || nextSize.height !== size.height) {
      onResize(nextSize);
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
