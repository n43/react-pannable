import React, { useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import resizeDetector from '../utils/resizeDetector';
import { isNumber } from '../utils/geometry';
import ItemContent from './ItemContent';

const defaultGeneralContentProps = { ...ItemContent.defaultProps };

function GeneralContent(props) {
  const { width, height, children } = props;
  const itemRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (isNumber(width) && isNumber(height)) {
      return;
    }

    if (resizeDetector) {
      const resizeNode = itemRef.current.getResizeNode();
      resizeDetector.listenTo(resizeNode, () =>
        itemRef.current.calculateSize()
      );

      return () => resizeDetector.uninstall(resizeNode);
    }
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
