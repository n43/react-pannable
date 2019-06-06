import { useEffect } from 'react';
import { useItemContent, defaultItemContentProps } from './useItemContent';
import resizeDetector from './utils/resizeDetector';

export const defaultGeneralContentProps = defaultItemContentProps;

export function useGeneralContent({
  width = defaultGeneralContentProps.width,
  height = defaultGeneralContentProps.height,
}) {
  const [props, { size, getResizeNode, calculateSize }] = useItemContent({
    width,
    height,
  });

  useEffect(() => {
    const resizeNode = getResizeNode();

    if (typeof width !== 'number' || typeof height !== 'number') {
      resizeDetector.listenTo(resizeNode, () => calculateSize());

      return () => resizeDetector.uninstall(resizeNode);
    }
  }, [width, height, getResizeNode, calculateSize]);

  return [props, { size, getResizeNode, calculateSize }];
}
