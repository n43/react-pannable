import React from 'react';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import Pad from './Pad';

export default class PadPlayer extends React.PureComponent {
  static defaultProps = {
    children: null,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    direction: 'vertical',
    autoplay: {
      delay: 3000,
      step: -300,
      disableOnInteraction: true,
    },
  };

  constructor(props) {
    super(props);

    this.padRef = React.createRef();
  }

  componentDidMount() {
    const { autoplay } = this.props;

    if (autoplay) {
      this._installAutoPlayer();
    }
  }

  componentDidUpdate(prevProps) {}

  componentWillUnmount() {
    this._uninstallAutoPlayer();
  }

  _installAutoPlayer() {
    const startTime = new Date().getTime();
    this._autoplayTimer = requestAnimationFrame(() => {
      this._autoplayTimer = undefined;
      this._checkForAutoPlaying(startTime);
    });
  }

  _uninstallAutoPlayer() {
    if (this._autoplayTimer) {
      this._autoplayTimer = undefined;
      cancelAnimationFrame(this._autoplayTimer);
    }
  }

  _checkForAutoPlaying = startTime => {
    const {
      direction,
      autoplay: { delay, step },
    } = this.props;
    const now = new Date().getTime();

    if (now - startTime >= delay) {
      startTime = now;
      const pad = this.padRef.current;
      let contentOffset = { ...pad.getContentOffset() };
      if (direction === 'horizontal') {
        contentOffset.x += step;
      } else {
        contentOffset.y += step;
      }

      pad.scrollTo({ offset: contentOffset, animated: true });
    }

    if (this._autoplayTimer) {
      cancelAnimationFrame(this._autoplayTimer);
    }

    this._autoplayTimer = requestAnimationFrame(() => {
      this._autoplayTimer = undefined;
      this._checkForAutoPlaying(startTime);
    });
  };

  render() {
    const { width, height, contentWidth, contentHeight, children } = this.props;

    return (
      <Pad
        ref={this.padRef}
        width={width}
        height={height}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
      >
        {typeof children === 'function'
          ? children(this.padRef.current)
          : children}
      </Pad>
    );
  }
}
