import { useItemContent, defaultItemContentProps } from './useItemContent';

function ItemContent(props) {
  return useItemContent(props)[0];
}
ItemContent.defaultProps = defaultItemContentProps;

export default ItemContent;
