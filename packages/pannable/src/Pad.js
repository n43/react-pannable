import { usePad, defaultPadProps } from './usePad';

function Pad(props) {
  return usePad(props)[0];
}
Pad.defaultProps = defaultPadProps;

export default Pad;
