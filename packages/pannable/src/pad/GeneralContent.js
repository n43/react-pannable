import React, { useRef, useEffect } from 'react';
import resizeDetector from '../utils/resizeDetector';
import { isNumber } from '../utils/geometry';
import ItemContent from './ItemContent';

const defaultGeneralContentProps = { ...ItemContent.defaultProps };

function GeneralContent(props) {
  const { width, height, children } = props;
  const itemRef = useRef({});

  useEffect(() => {
    if (isNumber(width) && isNumber(height)) {
      return;
    }

    const { getResizeNode, calculateSize } = itemRef.current;

    const resizeNode = getResizeNode();

    resizeDetector.listenTo(resizeNode, () => {
      calculateSize();
    });

    return () => {
      resizeDetector.uninstall(resizeNode);
    };
  }, [width, height]);

  return (
    <ItemContent {...props}>
      {(size, apis) => {
        itemRef.current = apis;

        return typeof children === 'function' ? children(size, apis) : children;
      }}
    </ItemContent>
  );
}
GeneralContent.defaultProps = defaultGeneralContentProps;
GeneralContent.PadContent = true;

export default GeneralContent;
