import { usePannable, defaultPannableProps } from './usePannable';

function Pannable(pannableProps) {
  return usePannable(pannableProps)[0];
}
Pannable.defaultProps = defaultPannableProps;

export default Pannable;
