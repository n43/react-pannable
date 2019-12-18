import React, { useRef, useState, useEffect } from 'react';
import resizeDetector from '../utils/resizeDetector';
import { isNumber } from '../utils/geometry';
import ItemContent from './ItemContent';

const defaultGeneralContentProps = { ...ItemContent.defaultProps };

function GeneralContent(props) {
  const { width, height, children } = props;
  const [size, setSize] = useState(null);
  const itemRef = useRef({});

  useEffect(() => {
    if (isNumber(width) && isNumber(height)) {
      return;
    }

    const { getResizeNode, calculateSize } = itemRef.current;

    if (size) {
      const resizeNode = getResizeNode();

      resizeDetector.listenTo(resizeNode, () => {
        calculateSize();
      });

      return () => {
        resizeDetector.uninstall(resizeNode);
      };
    }
  }, [width, height, size]);

  return (
    <ItemContent {...props}>
      {(nextSize, apis) => {
        itemRef.current = apis;

        if (size !== nextSize) {
          setSize(nextSize);
        }

        return typeof children === 'function'
          ? children(nextSize, apis)
          : children;
      }}
    </ItemContent>
  );
}
GeneralContent.defaultProps = defaultGeneralContentProps;
GeneralContent.PadContent = true;

export default GeneralContent;
