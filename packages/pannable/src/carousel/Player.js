import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';

export default class Player extends React.Component {
  static defaultProps = {
    ...Pad.defaultProps,
    direction: 'x',
    autoplayEnabled: true,
    autoplayInterval: 3000,
    loop: true,
    pagingEnabled: true,
  };

  constructor(props) {
    super(props);

    this.state = { mouseEntered: false, loopCount: 1 };
    this.padRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.autoplayEnabled) {
      this._startPlaying();
    }
  }

  componentDidUpdate(prevProps) {
    const { autoplayEnabled, autoplayInterval } = this.props;

    if (
      autoplayEnabled !== prevProps.autoplayEnabled ||
      autoplayInterval !== prevProps.autoplayInterval
    ) {
      this._stopPlaying();
      if (autoplayEnabled) {
        this._startPlaying();
      }
    }
  }

  componentWillUnmount() {
    this._stopPlaying();
  }

  go({ delta, animated }) {
    const { direction } = this.props;
    const { loopCount } = this.state;
    const pad = this.padRef.current;

    pad.scrollTo({
      offset: (state, props) => {
        const { contentOffset, size, contentSize } = state;
        const { pagingEnabled } = props;

        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        let offsetX = contentOffset[x] - delta * size[width];

        if (loopCount <= 1) {
          const sizeWidth = size[width];
          let minOffsetX = Math.min(sizeWidth - contentSize[width], 0);

          if (pagingEnabled && sizeWidth > 0) {
            minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
          }

          if (contentOffset[x] === 0) {
            offsetX = minOffsetX;
          } else if (contentOffset[x] === minOffsetX) {
            offsetX = 0;
          }
          if (0 < offsetX) {
            offsetX = 0;
          } else if (offsetX < minOffsetX) {
            offsetX = minOffsetX;
          }
        }

        return { [x]: offsetX, [y]: contentOffset[y] };
      },
      animated,
    });
  }

  rewind() {
    this.go({ delta: -1 });
  }

  forward() {
    this.go({ delta: 1 });
  }

  _startPlaying() {
    const pad = this.padRef.current;

    if (!pad || pad.isDragging() || pad.isDecelerating()) {
      return;
    }
    if (this.state.mouseEntered) {
      return;
    }

    const { autoplayInterval } = this.props;

    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this._autoplayTimer = undefined;
      this.forward();
    }, autoplayInterval);
  }

  _stopPlaying() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
    }
  }

  _onPadDragStart = evt => {
    this._stopPlaying();

    this.props.onDragStart(evt);
  };
  _onPadDragEnd = evt => {
    this._startPlaying();

    this.props.onDragEnd(evt);
  };
  _onPadDecelerationStart = evt => {
    this._stopPlaying();

    this.props.onDecelerationStart(evt);
  };
  _onPadDecelerationEnd = evt => {
    this._startPlaying();

    this.props.onDecelerationEnd(evt);
  };
  _onPadMouseEnter = evt => {
    const { onMouseEnter } = this.props;

    this.setState({ mouseEntered: true }, () => {
      this._stopPlaying();
    });

    if (onMouseEnter) {
      onMouseEnter(evt);
    }
  };
  _onPadMouseLeave = evt => {
    const { onMouseLeave } = this.props;

    this.setState({ mouseEntered: false }, () => {
      this._startPlaying();
    });

    if (onMouseLeave) {
      onMouseLeave(evt);
    }
  };

  _onPadScroll = evt => {
    const { direction, onScroll } = this.props;
    const { loopCount } = this.state;
    const pad = this.padRef.current;

    pad.scrollTo({
      offset: state => {
        const { contentOffset, size, contentSize } = state;

        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        const itemSizeWidth = contentSize[width] / loopCount;
        const bufferWidth =
          0.5 * (contentSize[width] - itemSizeWidth - size[width]);
        const maxOffsetX = 0 - bufferWidth;
        const minOffsetX = size[width] - contentSize[width] + bufferWidth;

        let offsetX = contentOffset[x];
        if (offsetX <= minOffsetX) {
          offsetX += itemSizeWidth;
        } else if (maxOffsetX < offsetX) {
          offsetX -= itemSizeWidth;
        }

        if (offsetX === contentOffset[x]) {
          return null;
        }

        return { [x]: offsetX, [y]: contentOffset[y] };
      },
      animated: false,
    });

    onScroll(evt);
  };

  _onPadContentResize = contentSize => {
    this.setState((state, props) => {
      const { loopCount } = state;
      const { direction, loop } = props;

      let nextLoopCount = 1;

      if (loop) {
        const size = { width: props.width, height: props.height };
        const width = direction === 'y' ? 'height' : 'width';

        const sizeWidth = size[width];
        let itemSizeWidth = contentSize[width] / loopCount;

        if (itemSizeWidth && sizeWidth) {
          nextLoopCount += 1 + Math.floor(sizeWidth / itemSizeWidth);
        }
      }

      if (nextLoopCount === loopCount) {
        return null;
      }

      return { loopCount: nextLoopCount };
    });
    this.props.onContentResize(contentSize);
  };

  render() {
    const {
      direction,
      autoplayEnabled,
      autoplayInterval,
      loop,
      scrollsBackOnEdge,
      ...padProps
    } = this.props;
    const { loopCount } = this.state;

    if (direction === 'x') {
      padProps.alwaysBounceY = false;
    } else {
      padProps.alwaysBounceX = false;
    }

    let element = padProps.children;

    if (typeof element === 'function') {
      element = element(this);
    }

    padProps.children = (
      <ListContent
        direction={direction}
        itemCount={loopCount}
        renderItem={({ Item }) => <Item forceRender>{element}</Item>}
      />
    );

    padProps.onContentResize = this._onPadContentResize;

    if (loopCount > 1) {
      padProps.onScroll = this._onPadScroll;
    }

    if (autoplayEnabled) {
      padProps.onDragStart = this._onPadDragStart;
      padProps.onDragEnd = this._onPadDragEnd;
      padProps.onDecelerationStart = this._onPadDecelerationStart;
      padProps.onDecelerationEnd = this._onPadDecelerationEnd;
      padProps.onMouseEnter = this._onPadMouseEnter;
      padProps.onMouseLeave = this._onPadMouseLeave;
    }

    return <Pad {...padProps} ref={this.padRef} />;
  }
}
