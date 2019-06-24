import React, {
  isValidElement,
  cloneElement,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import PadContext from './PadContext';
import ItemContent from './ItemContent';
import useIsomorphicLayoutEffect from './hooks/useIsomorphicLayoutEffect';
import usePrevRef from './hooks/usePrevRef';
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

function ListContent({
  width,
  height,
  direction,
  spacing,
  itemCount,
  estimatedItemWidth,
  estimatedItemHeight,
  renderItem,
  ...props
}) {
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

  const resizeContent = useCallback(
    itemHash => itemSize =>
      setItemSizeDict(itemSizeDict => {
        return isEqualToSize(itemSize, itemSizeDict[itemHash])
          ? itemSizeDict
          : { ...itemSizeDict, [itemHash]: itemSize };
      }),
    []
  );

  useIsomorphicLayoutEffect(() => {
    context.resizeContent(size);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(size, prevLayout.size)) {
      context.resizeContent(size);
    }

    if (nextItemHashList.join() !== itemHashList.join()) {
      setItemHashList(nextItemHashList);
    }
  });

  function buildItem(layoutAttrs) {
    const { itemIndex, rect, visibleRect, needsRender, Item } = layoutAttrs;
    let element = renderItem(layoutAttrs);

    let itemStyle = {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };
    let forceRender;
    let hash;
    let key;

    if (isValidElement(element) && element.type === Item) {
      if (element.props.style) {
        itemStyle = { ...itemStyle, ...element.props.style };
      }
      forceRender = element.props.forceRender;
      hash = element.props.hash;
      key = element.key;

      element = element.props.children;
    }

    if (!key) {
      key = '' + itemIndex;
    }
    if (hash === undefined) {
      hash = key;
    }

    let shouldRender = forceRender || needsRender;
    const itemSize = itemSizeDict[hash];

    if (!itemSize && nextItemHashList.indexOf(hash) !== -1) {
      shouldRender = false;
    }

    nextItemHashList[itemIndex] = hash;

    if (!shouldRender) {
      return null;
    }

    const sizeProps = {};

    if (itemSize) {
      sizeProps.width = itemSize.width;
      sizeProps.height = itemSize.height;
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
        itemStyle = { ...itemStyle, ...element.props.style };
      }
      if (typeof element.props.width === 'number') {
        sizeProps.width = element.props.width;
      }
      if (typeof element.props.height === 'number') {
        sizeProps.height = element.props.height;
      }

      element = cloneElement(element, {
        ref: element.ref,
        style: itemStyle,
        ...sizeProps,
      });
    } else {
      element = (
        <ItemContent style={itemStyle} {...sizeProps}>
          {element}
        </ItemContent>
      );
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

  props.style = {
    ...elemStyle,
    ...props.style,
  };

  const items = [];

  for (let itemIndex = 0; itemIndex < layoutList.length; itemIndex++) {
    const attrs = layoutList[itemIndex];
    const layoutAttrs = {
      ...attrs,
      itemIndex,
      visibleRect: getItemVisibleRect(attrs.rect, context.visibleRect),
      needsRender: needsRender(attrs.rect, context.visibleRect),
      Item,
    };

    items.push(buildItem(layoutAttrs));
  }

  return <div {...props}>{items}</div>;
}

ListContent.defaultProps = defaultListContentProps;
ListContent.PadContext = true;

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
    const itemHash = itemHashList[itemIndex];
    let itemSize = itemSizeDict[itemHash] || {
      [width]:
        fixed[width] === undefined ? estimatedItemSize[width] : fixed[width],
      [height]: estimatedItemSize[height],
    };

    layoutList.push({
      rect: {
        [x]: 0,
        [y]: sizeHeight,
        [width]: itemSize[width],
        [height]: itemSize[height],
      },
    });

    if (itemSize[height] > 0) {
      sizeHeight += itemSize[height];

      if (itemIndex < itemCount - 1) {
        sizeHeight += spacing;
      }
    }
    if (sizeWidth < itemSize[width]) {
      sizeWidth = itemSize[width];
    }
  }

  return {
    size: { [width]: sizeWidth, [height]: sizeHeight },
    fixed,
    layoutList,
  };
}
