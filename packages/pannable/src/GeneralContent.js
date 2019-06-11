import React, { useEffect, useRef } from 'react';
import ItemContent from './ItemContent';
import resizeDetector from './utils/resizeDetector';

const defaultGeneralContentProps = ItemContent.defaultProps;

function GeneralContent({
  width = defaultGeneralContentProps.width,
  height = defaultGeneralContentProps.height,
  ...props
}) {
  const elemRef = useRef(null);

  useEffect(() => {
    if (typeof width === 'number' && typeof height === 'number') {
      return;
    }

    const resizeNode = elemRef.current.getResizeNode();

    resizeDetector.listenTo(resizeNode, () => elemRef.current.calculateSize());

    return () => resizeDetector.uninstall(resizeNode);
  }, [width, height]);

  return <ItemContent {...props} ref={elemRef} />;
}
GeneralContent.defaultProps = defaultGeneralContentProps;
GeneralContent.PadContent = true;

export default GeneralContent;
