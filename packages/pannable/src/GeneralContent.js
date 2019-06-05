import {
  useGeneralContent,
  defaultGeneralContentProps,
} from './useGeneralContent';

function GeneralContent(props) {
  return useGeneralContent(props)[0];
}
GeneralContent.defaultProps = defaultGeneralContentProps;

export default GeneralContent;
