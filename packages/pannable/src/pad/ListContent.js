import React, {
  isValidElement,
  cloneElement,
  useState,
  useContext,
  useMemo,
} from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { getItemVisibleRect, needsRender } from '../utils/visible';
import { isEqualToSize, isNumber } from '../utils/geometry';
import PadContext from './PadContext';
import ItemContent from './ItemContent';

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
  const context = useContext(PadContext);
  const [itemHashList, setItemHashList] = useState([]);
  const [itemSizeDict, setItemSizeDict] = useState({});
  const layout = useMemo(
    () =>
      calculateLayout(
        {
          width,
          height,
          direction,
          spacing,
          itemCount,
          estimatedItemWidth,
          estimatedItemHeight,
        },
        itemHashList,
        itemSizeDict
      ),
    [
      width,
      height,
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
    if (prevLayout.type !== layout.type) {
      setItemSizeDict({});
    }
  });

  function buildItem(attrs) {
    const { rect, itemIndex, itemSize, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key = `ListContent_` + itemIndex;
    let hash;
    const itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };

    if (isValidElement(element) && element.type === Item) {
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

    const sizeProps = {};

    if (isNumber(layout.fixed.width)) {
      sizeProps.width = layout.fixed.width;
    }
    if (isNumber(layout.fixed.height)) {
      sizeProps.height = layout.fixed.height;
    }

    if (isValidElement(element) && element.type.PadContent) {
      if (element.props.style) {
        Object.assign(itemStyle, element.props.style);
      }
      if (isNumber(element.props.width)) {
        sizeProps.width = element.props.width;
      }
      if (isNumber(element.props.height)) {
        sizeProps.height = element.props.height;
      }

      element = cloneElement(element, {
        ...sizeProps,
        style: itemStyle,
        ref: element.ref,
      });
    } else {
      if (itemSize) {
        Object.assign(sizeProps, itemSize);
      }

      element = (
        <ItemContent {...sizeProps} style={itemStyle}>
          {element}
        </ItemContent>
      );
    }

    function onResize(itemSize) {
      setItemSizeDict(itemSizeDict =>
        isEqualToSize(itemSizeDict[hash], itemSize)
          ? itemSizeDict
          : { ...itemSizeDict, [hash]: itemSize }
      );
    }

    return (
      <PadContext.Provider
        key={key}
        value={{ ...context, visibleRect, onResize }}
      >
        {element}
      </PadContext.Provider>
    );
  }

  const elemStyle = { position: 'relative' };

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
  const {
    direction,
    spacing,
    itemCount,
    estimatedItemWidth,
    estimatedItemHeight,
  } = props;
  const size = { width: props.width, height: props.height };

  const [x, y, width, height] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width']
      : ['x', 'y', 'width', 'height'];

  let sizeWidth = 0;
  let sizeHeight = 0;
  const layoutList = [];
  const fixed = {};
  const type = [direction, size[width]].join();

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
          : typeof estimatedItemWidth === 'function'
          ? estimatedItemWidth(itemIndex)
          : estimatedItemWidth;

      rect[height] =
        typeof estimatedItemHeight === 'function'
          ? estimatedItemHeight(itemIndex)
          : estimatedItemHeight;
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
    size: { [width]: sizeWidth, [height]: sizeHeight },
    fixed,
    layoutList,
    type,
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
