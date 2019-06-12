import React, { useRef } from 'react';
import ItemContent from './ItemContent';
import resizeDetector from './utils/resizeDetector';
import useIsomorphicLayoutEffect from './utils/useIsomorphicLayoutEffect';

const defaultGeneralContentProps = {
  width: null,
  height: null,
};

function GeneralContent(props) {
  const {
    width = defaultGeneralContentProps.width,
    height = defaultGeneralContentProps.height,
  } = props;
  const elemRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
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
