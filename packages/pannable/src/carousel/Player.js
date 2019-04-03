import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';

export default class Player extends React.Component {
  static defaultProps = {
    direction: 'x',
    autoplayEnabled: true,
    autoplayInterval: 3000,
    loop: true,
    pagingEnabled: true,
    onFrameChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      contentOffset: { x: 0, y: 0 },
      touchDirection: 0,
      dragging: false,
      decelerating: false,
      mouseEntered: false,
      playingEnabled: props.autoplayEnabled,
    };

    this._decelerateTimestamp = 0;
  }

  static getDerivedStateFromProps(props, state) {
    const { autoplayEnabled } = props;
    const { dragging, decelerating, mouseEntered, playingEnabled } = state;

    let nextState = {};
    let nextPlayingEnabled;

    if (autoplayEnabled && !dragging && !decelerating && !mouseEntered) {
      nextPlayingEnabled = true;
    } else {
      nextPlayingEnabled = false;
    }

    if (playingEnabled !== nextPlayingEnabled) {
      nextState.playingEnabled = nextPlayingEnabled;
    }

    return nextState;
  }

  componentDidMount() {
    if (this.props.autoplayEnabled) {
      this._start();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { playingEnabled } = this.state;

    if (prevState.playingEnabled !== playingEnabled) {
      if (playingEnabled) {
        this._start();
      } else {
        this._stop();
      }
    }
  }

  componentWillUnmount() {
    this._stop();
  }

  setFrame({ offset, animated = true }) {
    const { direction } = this.props;
    const pad = this.padRef;
    const contentSize = pad.getContentSize();
    const contentOffset = pad.getContentOffset();

    const [width, height, x, y] =
      direction === 'x'
        ? ['width', 'height', 'x', 'y']
        : ['height', 'width', 'y', 'x'];

    let nextContentOffset = {
      [x]: contentOffset[x] + offset[x],
      [y]: contentOffset[y] + offset[y],
    };

    if (
      nextContentOffset[x] > 0 ||
      nextContentOffset[y] > 0 ||
      Math.abs(nextContentOffset[x]) >= contentSize[width] ||
      Math.abs(nextContentOffset[y]) >= contentSize[height]
    ) {
      return;
    }

    pad.scrollTo({ offset: nextContentOffset, animated });
  }

  rewind() {
    const { direction } = this.props;
    const pad = this.padRef;
    const size = pad.getSize();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    this.setFrame({
      offset: { [x]: size[width], [y]: 0 },
    });
  }

  forward() {
    const { direction } = this.props;
    const pad = this.padRef;
    const size = pad.getSize();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    this.setFrame({
      offset: { [x]: -size[width], [y]: 0 },
    });
  }

  _start() {
    const { autoplayInterval } = this.props;

    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this._autoplayTimer = undefined;
      this._play();
    }, autoplayInterval);
  }

  _play() {
    const { direction } = this.props;
    const { playingEnabled } = this.state;

    if (!playingEnabled) {
      return;
    }

    const pad = this.padRef;
    const size = pad.getSize();
    const contentSize = pad.getContentSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    if (contentSize[width] - Math.abs(contentOffset[x]) >= 2 * size[width]) {
      this.forward();
    } else {
      this.setFrame({
        offset: { [x]: -contentOffset[x], [y]: 0 },
      });
    }

    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
    }
  }

  _stop() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
    }
  }

  _onPadScroll = evt => {
    const { dragging, decelerating } = evt;
    const { onScroll } = this.props;
    let nextState = {};

    if (this.state.dragging !== dragging) {
      nextState.dragging = dragging;
    }
    if (this.state.decelerating !== decelerating) {
      nextState.decelerating = decelerating;
    }

    this._alternateFramesForLoop();

    this.setState(nextState);

    if (onScroll) {
      onScroll(evt);
    }
  };

  _alternateFramesForLoop() {
    const { direction } = this.props;
    const pad = this.padRef;
    const contentSize = pad.getContentSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    const min = parseFloat(contentSize[width] / 4);
    const max = parseFloat((contentSize[width] * 3) / 4);

    if (contentOffset[x] < min || contentOffset[x] >= max) {
      let m = contentOffset[x] < min ? 1 : -1;
      const offsetX = contentOffset[x] + (contentSize[width] / 2) * m;
      this.setFrame({
        offset: { [x]: offsetX, [y]: 0 },
        animated: false,
      });
    }
  }

  _onMouseEnter = () => {
    this.setState({ mouseEntered: true });
  };

  _onMouseLeave = () => {
    this.setState({ mouseEntered: false });
  };

  render() {
    const {
      direction,
      autoplayEnabled,
      autoplayInterval,
      loop,
      onFrameChange,
      children,
      ...padProps
    } = this.props;

    let bounceConfig = { alwaysBounceX: false, alwaysBounceY: false };
    if (direction === 'x') {
      bounceConfig.alwaysBounceX = true;
    } else {
      bounceConfig.alwaysBounceY = true;
    }

    const element = typeof children === 'function' ? children(this) : children;

    return (
      <Pad
        {...padProps}
        {...bounceConfig}
        onScroll={this._onPadScroll}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
      >
        {pad => {
          this.padRef = pad;
          const size = pad.getSize();

          if (loop) {
            return (
              <ListContent
                direction={direction}
                width={size.width}
                height={size.height}
                itemCount={2}
                renderItem={() => {
                  return element;
                }}
              />
            );
          }

          return element;
        }}
      </Pad>
    );
  }
}
