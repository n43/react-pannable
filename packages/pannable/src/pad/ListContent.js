import React, { useState, useContext, useMemo } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize, isNumber } from '../utils/geometry';
import PadContext from './PadContext';

function Item() {}

const defaultListContentProps = {
  width: null,
  height: null,
  direction: 'y',
  spacing: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
  itemCount: 0,
  renderItem: () => null,
};

function ListContent(props) {
  const context = useContext(PadContext);
  const {
    width,
    height,
    direction,
    spacing,
    estimatedItemWidth,
    estimatedItemHeight,
    itemCount,
    renderItem,
    children,
    ...divProps
  } = props;
  const [itemHashList, setItemHashList] = useState([]);
  const [itemSizeDict, setItemSizeDict] = useState({});

  const fixedWidth = isNumber(width) ? width : context.width;
  const fixedHeight = isNumber(height) ? height : context.height;

  const layout = useMemo(
    () =>
      calculateLayout(
        {
          direction,
          size: {
            width: fixedWidth,
            height: fixedHeight,
          },
          spacing,
          itemCount,
          estimatedItemSize: {
            width: estimatedItemWidth,
            height: estimatedItemHeight,
          },
        },
        itemHashList,
        itemSizeDict
      ),
    [
      fixedWidth,
      fixedHeight,
      direction,
      spacing,
      itemCount,
      estimatedItemWidth,
      estimatedItemHeight,
      itemHashList,
      itemSizeDict,
    ]
  );
  const prevLayoutRef = usePrevRef(layout);
  const prevLayout = prevLayoutRef.current;
  const nextItemHashList = [];

  useIsomorphicLayoutEffect(() => {
    context.onResize(layout.size);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(prevLayout.size, layout.size)) {
      context.onResize(layout.size);
    }
  });

  function buildItem(attrs) {
    const { rect, itemIndex, itemSize, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key = `ListContent_` + itemIndex;
    let hash;

    if (React.isValidElement(element) && element.type === Item) {
      if (element.props.forceRender !== undefined) {
        forceRender = element.props.forceRender;
      }
      if (element.key) {
        key = element.key;
      }
      if (element.props.hash !== undefined) {
        hash = element.props.hash;
      }

      element = element.props.children;
    }

    if (hash === undefined) {
      hash = key;
    }

    let skipRender = !needsRender && !forceRender;

    if (!itemSize && nextItemHashList.indexOf(hash) !== -1) {
      skipRender = true;
    }

    nextItemHashList[itemIndex] = hash;

    if (skipRender) {
      return null;
    }

    const sizeProps = {
      width: null,
      height: null,
      ...itemSize,
    };

    const itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    function onResize(itemSize) {
      setItemSizeDict(itemSizeDict => ({ ...itemSizeDict, [hash]: itemSize }));
    }

    return (
      <PadContext.Provider
        key={key}
        value={{ ...context, ...sizeProps, visibleRect, onResize }}
      >
        <div style={itemStyle}>{element}</div>
      </PadContext.Provider>
    );
  }

  const elemStyle = { position: 'relative', overflow: 'hidden' };

  if (layout.size) {
    elemStyle.width = layout.size.width;
    elemStyle.height = layout.size.height;
  }

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }
  divProps.style = elemStyle;

  const items = layout.layoutList.map(attrs =>
    buildItem({
      ...attrs,
      visibleRect: getItemVisibleRect(attrs.rect, context.visibleRect),
      needsRender: needsRender(attrs.rect, context.visibleRect),
      Item,
    })
  );

  if (!isEqualToArray(itemHashList, nextItemHashList)) {
    setItemHashList(nextItemHashList);
  }

  if (typeof children === 'function') {
    children(layout);
  }

  return <div {...divProps}>{items}</div>;
}

ListContent.defaultProps = defaultListContentProps;
ListContent.PadContent = true;

export default ListContent;

function calculateLayout(props, itemHashList, itemSizeDict) {
  const { direction, size, spacing, itemCount, estimatedItemSize } = props;

  const [x, y, width, height] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width']
      : ['x', 'y', 'width', 'height'];

  let sizeWidth = 0;
  let sizeHeight = 0;
  const layoutList = [];
  const fixed = {};

  if (isNumber(size[width])) {
    fixed[width] = size[width];
  }

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const itemHash = itemHashList[itemIndex] || null;
    const itemSize = itemSizeDict[itemHash] || null;
    const rect = { [x]: 0, [y]: sizeHeight };

    if (itemSize) {
      Object.assign(rect, itemSize);
    } else {
      rect[width] =
        fixed[width] !== undefined
          ? fixed[width]
          : typeof estimatedItemSize[width] === 'function'
          ? estimatedItemSize[width](itemIndex)
          : estimatedItemSize[width];

      rect[height] =
        typeof estimatedItemSize[height] === 'function'
          ? estimatedItemSize[height](itemIndex)
          : estimatedItemSize[height];
    }

    layoutList.push({ rect, itemIndex, itemHash, itemSize });

    if (rect[height] > 0) {
      sizeHeight += rect[height];

      if (itemIndex < itemCount - 1) {
        sizeHeight += spacing;
      }
    }
    if (sizeWidth < rect[width]) {
      sizeWidth = rect[width];
    }
  }

  return {
    size: {
      [width]: fixed[width] !== undefined ? fixed[width] : sizeWidth,
      [height]: fixed[height] !== undefined ? fixed[height] : sizeHeight,
    },
    layoutList,
  };
}

function isEqualToArray(a1, a2) {
  if (a1 === a2) {
    return true;
  }
  if (!a1 || !a2) {
    return false;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  for (let idx = 0; idx < a1.length; idx++) {
    if (a1[idx] !== a2[idx]) {
      return false;
    }
  }

  return true;
}
