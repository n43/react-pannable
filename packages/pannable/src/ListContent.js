import React, {
  isValidElement,
  cloneElement,
  useState,
  useContext,
  useMemo,
} from 'react';
import PadContext from './PadContext';
import ItemContent from './ItemContent';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import { getItemVisibleRect, needsRender } from './utils/visible';
import { isEqualToSize } from './utils/geometry';

function Item() {}

const defaultListContentProps = {
  width: null,
  height: null,
  direction: 'y',
  spacing: 0,
  itemCount: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
  renderItem: () => null,
};

function ListContent(props) {
  const {
    width,
    height,
    direction,
    spacing,
    itemCount,
    estimatedItemWidth,
    estimatedItemHeight,
    renderItem,
    children,
    ...divProps
  } = props;
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
  const context = useContext(PadContext);

  const { size, fixed, layoutList } = layout;
  const prevLayout = prevLayoutRef.current;
  const nextItemHashList = [];

  useIsomorphicLayoutEffect(() => {
    context.resizeContent(size);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(prevLayout.size, size)) {
      context.resizeContent(size);
    }
  });

  function buildItem(attrs) {
    const { rect, itemIndex, itemSize, visibleRect, needsRender, Item } = attrs;
    let forceRender = false;
    let element = renderItem(attrs);

    let key = String(itemIndex);
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

    if (itemSize) {
      Object.assign(sizeProps, itemSize);
    } else {
      if (typeof fixed.width === 'number') {
        sizeProps.width = fixed.width;
      }
      if (typeof fixed.height === 'number') {
        sizeProps.height = fixed.height;
      }
    }

    if (isValidElement(element) && element.type.PadContent) {
      if (element.props.style) {
        Object.assign(itemStyle, element.props.style);
      }
      if (typeof element.props.width === 'number') {
        sizeProps.width = element.props.width;
      }
      if (typeof element.props.height === 'number') {
        sizeProps.height = element.props.height;
      }

      element = cloneElement(element, {
        ...sizeProps,
        style: itemStyle,
        ref: element.ref,
      });
    } else {
      element = (
        <ItemContent {...sizeProps} style={itemStyle}>
          {element}
        </ItemContent>
      );
    }

    function resizeContent(itemHash) {
      return function(itemSize) {
        setItemSizeDict(itemSizeDict =>
          isEqualToSize(itemSizeDict[itemHash], itemSize)
            ? itemSizeDict
            : { ...itemSizeDict, [itemHash]: itemSize }
        );
      };
    }

    return (
      <PadContext.Provider
        key={key}
        value={{ ...context, visibleRect, resizeContent: resizeContent(hash) }}
      >
        {element}
      </PadContext.Provider>
    );
  }

  const elemStyle = { position: 'relative' };

  if (size) {
    elemStyle.width = size.width;
    elemStyle.height = size.height;
  }

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }
  divProps.style = elemStyle;

  const items = layoutList.map(attrs =>
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
  const { direction, spacing, itemCount } = props;
  const size = { width: props.width, height: props.height };
  const estimatedItemSize = {
    width: props.estimatedItemWidth,
    height: props.estimatedItemHeight,
  };

  const [x, y, width, height] =
    direction === 'x'
      ? ['y', 'x', 'height', 'width']
      : ['x', 'y', 'width', 'height'];

  let sizeWidth = 0;
  let sizeHeight = 0;
  const layoutList = [];
  const fixed = {};

  if (typeof size[width] === 'number') {
    fixed[width] = size[width];
  }

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const itemHash = itemHashList[itemIndex] || null;
    const itemSize = itemSizeDict[itemHash] || null;
    const rect = { [x]: 0, [y]: sizeHeight };

    if (itemSize) {
      Object.assign(rect, itemSize);
    } else {
      Object.assign(rect, estimatedItemSize);

      if (fixed[width] !== undefined) {
        rect[width] = fixed[width];
      }
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
