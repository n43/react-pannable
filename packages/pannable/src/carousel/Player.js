import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';
import ItemContent from '../ItemContent';

export default class Player extends React.Component {
  static defaultProps = {
    ...Pad.defaultProps,
    direction: 'x',
    autoplayEnabled: true,
    autoplayInterval: 3000,
    loop: true,
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

  scrollTo({ offset, animated = true }) {
    const { direction } = this.props;
    const pad = this.padRef;
    const contentSize = pad.getContentSize();

    const [width, height, x, y] =
      direction === 'x'
        ? ['width', 'height', 'x', 'y']
        : ['height', 'width', 'y', 'x'];

    if (
      offset[x] > 0 ||
      offset[y] > 0 ||
      Math.abs(offset[x]) >= contentSize[width] ||
      Math.abs(offset[y]) >= contentSize[height]
    ) {
      return;
    }

    pad.scrollTo({ offset, animated });
  }

  rewind() {
    const { direction } = this.props;
    const pad = this.padRef;
    const size = pad.getSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    this.scrollTo({
      offset: { [x]: contentOffset[x] + size[width], [y]: contentOffset[y] },
    });
  }

  forward() {
    const { direction } = this.props;
    const pad = this.padRef;
    const size = pad.getSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    this.scrollTo({
      offset: { [x]: contentOffset[x] - size[width], [y]: contentOffset[y] },
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
    const { playingEnabled } = this.state;

    if (!playingEnabled) {
      return;
    }

    this.forward();
  }

  _stop() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
    }
  }

  _onPadScroll = evt => {
    const { dragging, decelerating } = evt;
    const { loop, onScroll } = this.props;
    let nextState = {};

    if (this.state.dragging !== dragging) {
      nextState.dragging = dragging;
    }
    if (this.state.decelerating !== decelerating) {
      nextState.decelerating = decelerating;
    }

    if (loop) {
      this._alternateFramesForLoop();
    }

    this.setState(nextState);

    onScroll(evt);
  };

  _alternateFramesForLoop() {
    const { direction } = this.props;
    const pad = this.padRef;
    const contentSize = pad.getContentSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    const offsetRange = 0.5 * contentSize[width];
    const minOffsetX = -contentSize[width] * 0.75;
    const maxOffsetX = minOffsetX + offsetRange;
    let offsetX = contentOffset[x];

    if (offsetX <= minOffsetX) {
      offsetX += offsetRange;
    } else if (maxOffsetX < offsetX) {
      offsetX -= offsetRange;
    }

    if (offsetX !== contentOffset[x]) {
      this.scrollTo({
        offset: { [x]: offsetX, [y]: contentOffset[y] },
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

  _renderContent() {
    const { direction, loop, children } = this.props;
    const pad = this.padRef;
    const padSize = pad.getSize();
    let element = children;

    if (typeof element === 'function') {
      element = element(this);
    }

    if (loop) {
      if (!React.isValidElement(element) || !element.props.connectWithPad) {
        element = <ItemContent hash="Item">{element}</ItemContent>;
      }
      return (
        <ListContent
          direction={direction}
          width={padSize.width}
          height={padSize.height}
          itemCount={2}
          renderItem={() => element}
        />
      );
    }

    return element;
  }

  render() {
    const {
      direction,
      autoplayEnabled,
      autoplayInterval,
      loop,
      onFrameChange,
      ...padProps
    } = this.props;

    if (direction === 'x') {
      padProps.alwaysBounceY = false;
    } else {
      padProps.alwaysBounceX = false;
    }

    padProps.onScroll = this._onPadScroll;
    padProps.onMouseEnter = this._onMouseEnter;
    padProps.onMouseLeave = this._onMouseLeave;

    return (
      <Pad {...padProps}>
        {pad => {
          this.padRef = pad;

          return this._renderContent();
        }}
      </Pad>
    );
  }
}
