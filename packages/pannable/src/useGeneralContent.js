import { useEffect } from 'react';
import { useItemContent, defaultItemContentProps } from './useItemContent';
import resizeDetector from './utils/resizeDetector';

export const defaultGeneralContentProps = defaultItemContentProps;

export function useGeneralContent(props) {
  const {
    width = defaultGeneralContentProps.width,
    height = defaultGeneralContentProps.height,
  } = props;
  const [element, itemRef] = useItemContent(props);

  useEffect(() => {
    if (typeof width !== 'number' || typeof height !== 'number') {
      const resizeNode = itemRef.resizeRef.current;

      resizeDetector.listenTo(resizeNode, () => itemRef.calculateSize());

      return () => resizeDetector.uninstall(resizeNode);
    }
  }, [width, height, itemRef]);

  return [element, itemRef];
}
