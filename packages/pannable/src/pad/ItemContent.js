import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
  useEffect,
} from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { isEqualToSize, isNumber } from '../utils/geometry';
import resizeDetector from '../utils/resizeDetector';
import PadContext from './PadContext';

const defaultItemContentProps = {
  width: null,
  height: null,
  autoResizing: false,
};

function ItemContent(props) {
  const context = useContext(PadContext);
  const { width, height, autoResizing, children, ...divProps } = props;
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const prevSize = prevSizeRef.current;
  const resizeRef = useRef(null);

  const fixedWidth = isNumber(width) ? width : context.width;
  const fixedHeight = isNumber(height) ? height : context.height;
  const isFixed = isNumber(fixedWidth) && isNumber(fixedHeight);

  const calculateSize = useCallback(node => {
    const size = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    };

    setSize(size);
  }, []);

  const onResize = useCallback(() => {}, []);

  useIsomorphicLayoutEffect(() => {
    if (size && !isEqualToSize(prevSize, size)) {
      context.onResize(size);
    }
  });

  useEffect(() => {
    if (!size) {
      calculateSize(resizeRef.current);
    }
  }, [size, calculateSize]);

  useEffect(() => {
    if (isFixed || !autoResizing) {
      return;
    }

    const resizeNode = resizeRef.current;
    resizeDetector.listenTo(resizeNode, calculateSize);

    return () => {
      resizeDetector.uninstall(resizeNode);
    };
  }, [isFixed, autoResizing, calculateSize]);

  useMemo(() => {
    let nextSize = null;

    if (isFixed) {
      nextSize = { width: fixedWidth, height: fixedHeight };
    }

    setSize(nextSize);
  }, [isFixed, fixedWidth, fixedHeight]);

  const resizeStyle = { position: 'absolute' };

  if (isNumber(fixedWidth)) {
    resizeStyle.width = fixedWidth;
  }
  if (isNumber(fixedHeight)) {
    resizeStyle.height = fixedHeight;
  }

  const divStyle = { position: 'relative' };

  if (size) {
    divStyle.width = size.width;
    divStyle.height = size.height;
  }
  if (divProps.style) {
    Object.assign(divStyle, divProps.style);
  }
  divProps.style = divStyle;

  let element = typeof children === 'function' ? children(size) : children;

  if (!isFixed) {
    element = (
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <div style={resizeStyle} ref={resizeRef}>
          {element}
        </div>
      </div>
    );
  }

  return (
    <div {...divProps}>
      <PadContext.Provider
        value={{ ...context, width: null, height: null, onResize }}
      >
        {element}
      </PadContext.Provider>
    </div>
  );
}

ItemContent.defaultProps = defaultItemContentProps;
ItemContent.PadContent = true;

export default ItemContent;
