import React from 'react';

export default class GridContent extends React.Component {
  static defaultProps = {
    pad: null,
    columnCount: 0,
    rowCount: 0,
    columnWidth: 0,
    rowHeight: 0,
    rowHash: ({ rowIndex }) => rowIndex,
    columnHash: ({ columnIndex }) => columnIndex,
    renderCell: () => null,
    cellKey: ({ columnIndex, rowIndex }) => rowIndex + '-' + columnIndex,
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

  scrollTo({
    rowIndex = 0,
    columnIndex = 0,
    rowAlign = 'auto',
    columnAlign = 'auto',
    animated,
  }) {
    const { pad } = this.props;

    if (!pad) {
      return;
    }

    const { x, y, width, height } = this.getCellRect({ rowIndex, columnIndex });
    const offset = getCellOffset(
      { x, y },
      { width, height },
      { row: rowAlign, column: columnAlign },
      pad.getContentOffset(),
      pad.getSize()
    );

    pad.scrollTo({ offset, animated });
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
    const { pad, renderCell, cellKey, children } = this.props;

    if (typeof children === 'function') {
      return children(this);
    }
    if (!pad) {
      return children;
    }

    const { xList, yList } = this.state;
    const grids = [];
    const contentOffset = pad.getContentOffset();
    const boundingSize = pad.getSize();

    for (let rowIndex = 0; rowIndex < yList.length; rowIndex++) {
      for (let columnIndex = 0; columnIndex < xList.length; columnIndex++) {
        const { x, y, width, height } = this.getCellRect({
          rowIndex,
          columnIndex,
        });

        if (
          needsRender({ x, y }, { width, height }, contentOffset, boundingSize)
        ) {
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

function getCellOffset(pos, size, align, cOffset, bSize, name) {
  if (name) {
    let nOffset;

    if (align === 'auto') {
      const direction = bSize < size ? -1 : 1;
      nOffset =
        -pos +
        direction *
          Math.max(
            0,
            Math.min(direction * (pos + cOffset), direction * (bSize - size))
          );
    } else {
      if (align === 'start') {
        align = 0;
      } else if (align === 'center') {
        align = 0.5;
      } else if (align === 'end') {
        align = 1;
      }
      if (typeof align !== 'number' || isNaN(align)) {
        align = 0.5;
      }

      nOffset = -pos + align * (bSize - size);
    }

    return nOffset;
  }

  return {
    x: getCellOffset(
      pos.x,
      size.width,
      align.row,
      cOffset.x,
      bSize.width,
      'row'
    ),
    y: getCellOffset(
      pos.y,
      size.height,
      align.column,
      cOffset.y,
      bSize.height,
      'column'
    ),
  };
}

function needsRender(pos, size, cOffset, bSize, name) {
  if (name) {
    const dPos = pos + cOffset;

    return -0.25 * bSize < dPos + size && dPos < 1.25 * bSize;
  }

  return (
    needsRender(pos.x, size.width, cOffset.x, bSize.width, 'x') &&
    needsRender(pos.y, size.height, cOffset.y, bSize.height, 'y')
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
