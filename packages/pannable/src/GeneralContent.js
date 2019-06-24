import React, { useRef } from 'react';
import ItemContent from './ItemContent';
import resizeDetector from './utils/resizeDetector';
import useIsomorphicLayoutEffect from './hooks/useIsomorphicLayoutEffect';

const defaultGeneralContentProps = { ...ItemContent.defaultProps };

function GeneralContent(props) {
  const { width, height } = props;
  const itemRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof width === 'number' && typeof height === 'number') {
      return;
    }

    const resizeNode = itemRef.current.getResizeNode();

    resizeDetector.listenTo(resizeNode, () => itemRef.current.calculateSize());

    return () => resizeDetector.uninstall(resizeNode);
  }, [width, height]);

  return (
    <ItemContent {...props}>
      {(size, apis) => {
        itemRef.current = apis;

        let element = props.children;

        if (typeof element === 'function') {
          element = element(size, apis);
        }

        return element;
      }}
    </ItemContent>
  );
}
GeneralContent.defaultProps = defaultGeneralContentProps;
GeneralContent.PadContent = true;

export default GeneralContent;
