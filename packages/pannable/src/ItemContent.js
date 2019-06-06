import React from 'react';
import { useItemContent, defaultItemContentProps } from './useItemContent';

function ItemContent({ width, height, ...props }) {
  const [contentProps] = useItemContent({ width, height });

  props.style = { ...contentProps.style, ...props.style };
  props.children = contentProps.render(props.children);

  return <div {...props} />;
}

ItemContent.defaultProps = defaultItemContentProps;
ItemContent.PadContent = true;

export default ItemContent;
