import React, { useState, useMemo, useRef, useContext, useEffect } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { isEqualToSize, isNumber } from '../utils/geometry';
import resizeDetector from '../utils/resizeDetector';
import PadContext from './PadContext';

function onPadContentResize() {}

const wrapperStyle = { position: 'absolute', top: 0, left: 0 };

const defaultItemContentProps = {
  width: null,
  height: null,
  autoResizing: false,
};

function ItemContent(props) {
  const context = useContext(PadContext);
  const { width, height, autoResizing, children, ...divProps } = props;
  const fixedWidth = isNumber(width)
    ? width
    : !autoResizing
    ? context.width
    : null;
  const fixedHeight = isNumber(height)
    ? height
    : !autoResizing
    ? context.height
    : null;
  const isFixed = isNumber(fixedWidth) && isNumber(fixedHeight);

  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const prevSize = prevSizeRef.current;
  const resizeRef = useRef(null);
  const methodsRef = useRef({
    calculateSize() {
      const node = resizeRef.current;
      const nextSize = {
        width: node.offsetWidth,
        height: node.offsetHeight,
      };

      setSize(size => (isEqualToSize(size, nextSize) ? size : nextSize));
    },
  });
  const responseRef = useRef({});

  responseRef.current.onResize = context.onResize;

  useMemo(() => {
    let nextSize = null;

    if (isFixed) {
      nextSize = { width: fixedWidth, height: fixedHeight };
    }

    setSize(size => (isEqualToSize(size, nextSize) ? size : nextSize));
  }, [isFixed, fixedWidth, fixedHeight]);

  useIsomorphicLayoutEffect(() => {
    if (prevSize !== size) {
      if (size) {
        responseRef.current.onResize(size);
      }
    }
  }, [size]);

  useEffect(() => {
    if (isFixed) {
      return;
    }

    methodsRef.current.calculateSize();

    if (autoResizing && resizeDetector) {
      const node = resizeRef.current;

      resizeDetector.listenTo(node, () => {
        methodsRef.current.calculateSize();
      });

      return () => {
        resizeDetector.uninstall(node);
      };
    }
  }, [isFixed, autoResizing]);

  const resizeStyle = useMemo(() => {
    const style = { position: 'absolute' };

    if (isNumber(fixedWidth)) {
      style.width = fixedWidth;
    }
    if (isNumber(fixedHeight)) {
      style.height = fixedHeight;
    }

    return style;
  }, [fixedWidth, fixedHeight]);

  let element = typeof children === 'function' ? children(size) : children;

  if (!isFixed) {
    element = (
      <div style={wrapperStyle}>
        <div style={resizeStyle} ref={resizeRef}>
          {element}
        </div>
      </div>
    );
  }

  const divStyle = useMemo(() => {
    const style = { position: 'relative' };

    if (size) {
      style.width = size.width;
      style.height = size.height;
    }
    if (divProps.style) {
      Object.assign(style, divProps.style);
    }

    return style;
  }, [size, divProps.style]);

  divProps.style = divStyle;

  return (
    <div {...divProps}>
      <PadContext.Provider
        value={{
          ...context,
          width: null,
          height: null,
          onResize: onPadContentResize,
        }}
      >
        {element}
      </PadContext.Provider>
    </div>
  );
}

ItemContent.defaultProps = defaultItemContentProps;

export default ItemContent;
