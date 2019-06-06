import React from 'react';
import {
  useGeneralContent,
  defaultGeneralContentProps,
} from './useGeneralContent';

function GeneralContent({ width, height, ...props }) {
  const [contentProps] = useGeneralContent(props);

  props.style = { ...contentProps.style, ...props.style };
  props.children = contentProps.render(props.children);

  return <div {...props} />;
}
GeneralContent.defaultProps = defaultGeneralContentProps;
GeneralContent.PadContent = true;

export default GeneralContent;
