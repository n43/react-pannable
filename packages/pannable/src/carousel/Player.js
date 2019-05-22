import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';

export default class Player extends React.Component {
  static defaultProps = {
    ...Pad.defaultProps,
    direction: 'x',
    autoplayEnabled: true,
    autoplayInterval: 5000,
    loop: true,
    pagingEnabled: true,
    directionalLockEnabled: true,
  };

  state = { mouseEntered: false, loopCount: 1, loopTimes: 0 };
  padRef = React.createRef();

  static getDerivedStateFromProps(props, state) {
    const { loop } = props;
    const { loopCount } = state;
    let nextState = null;

    if (!loop && loopCount !== 1) {
      nextState = nextState || {};

      nextState.loopCount = 1;
      nextState.loopTimes = 0;
    }

    return nextState;
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
      if (autoplayEnabled) {
        this._startPlaying();
      } else {
        this._stopPlaying();
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
      offset: (padState, padProps) => {
        const {
          contentOffset,
          size,
          contentSize,
          drag,
          deceleration,
        } = padState;
        const { pagingEnabled } = padProps;

        if (drag || deceleration) {
          return null;
        }

        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        const sizeWidth = size[width];
        let offsetX = contentOffset[x] - delta * sizeWidth;

        if (loopCount <= 1) {
          let minOffsetX = Math.min(sizeWidth - contentSize[width], 0);

          if (pagingEnabled && sizeWidth > 0) {
            minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
          }

          if (offsetX < minOffsetX) {
            offsetX = offsetX <= minOffsetX - sizeWidth ? 0 : minOffsetX;
          } else if (0 < offsetX) {
            offsetX = sizeWidth <= offsetX ? minOffsetX : 0;
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

    this.setState({ mouseEntered: true }, () => this._stopPlaying());

    if (onMouseEnter) {
      onMouseEnter(evt);
    }
  };
  _onPadMouseLeave = evt => {
    const { onMouseLeave } = this.props;

    this.setState({ mouseEntered: false }, () => this._startPlaying());

    if (onMouseLeave) {
      onMouseLeave(evt);
    }
  };

  _onPadScroll = evt => {
    this.setState((state, props) => {
      const { direction } = props;
      const { loopCount, loopTimes } = state;
      const pad = this.padRef.current;
      const { contentOffset, size, contentSize } = pad.state;

      if (loopCount === 1) {
        return null;
      }

      const [adjustedContentOffset, delta] = adjustedContentOffsetForLoop(
        contentOffset,
        size,
        contentSize,
        loopCount,
        direction
      );

      if (contentOffset !== adjustedContentOffset) {
        pad.scrollTo({ offset: adjustedContentOffset, animated: false });

        return { loopTimes: loopTimes + delta };
      }

      return null;
    });

    this.props.onScroll(evt);
  };

  _onPadContentResize = contentSize => {
    this.setState((state, props) => {
      const { loopCount, loopTimes } = state;
      const { direction } = props;
      const pad = this.padRef.current;
      const { contentOffset, size, contentSize } = pad.state;

      let nextState = null;
      let nextLoopCount = calculateLoopCount(
        size,
        contentSize,
        loopCount,
        direction
      );

      if (nextLoopCount !== loopCount) {
        nextState = nextState || {};

        nextState.loopCount = nextLoopCount;
        nextState.loopTimes = 0;
      } else {
        const [adjustedContentOffset, delta] = adjustedContentOffsetForLoop(
          contentOffset,
          size,
          contentSize,
          loopCount,
          direction
        );

        if (contentOffset !== adjustedContentOffset) {
          pad.scrollTo({ offset: adjustedContentOffset, animated: false });

          nextState = nextState || {};
          nextState.loopTimes = loopTimes + delta;
        }
      }

      return nextState;
    });

    this.props.onContentResize(contentSize);
  };

  render() {
    const {
      direction,
      autoplayEnabled,
      autoplayInterval,
      loop,
      ...padProps
    } = this.props;
    const { loopCount, loopTimes } = this.state;

    if (direction === 'x') {
      padProps.alwaysBounceY = false;
    } else {
      padProps.alwaysBounceX = false;
    }

    let element = padProps.children;

    if (typeof element === 'function') {
      element = element(this.state);
    }

    if (loop) {
      padProps.onContentResize = this._onPadContentResize;
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

    return (
      <Pad {...padProps} ref={this.padRef}>
        <ListContent
          direction={direction}
          itemCount={loopCount}
          renderItem={({ Item, itemIndex }) => (
            <Item key={itemIndex + loopTimes} hash="loop">
              {element}
            </Item>
          )}
        />
      </Pad>
    );
  }
}

function calculateLoopCount(size, contentSize, loopCount, direction) {
  const width = direction === 'y' ? 'height' : 'width';

  const itemWidth = contentSize[width] / loopCount;
  const sizeWidth = size[width];

  if (!itemWidth || !sizeWidth) {
    return 1;
  }

  return 2 + Math.floor(sizeWidth / itemWidth);
}

function adjustedContentOffsetForLoop(
  contentOffset,
  size,
  contentSize,
  loopCount,
  direction
) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const contentWidth = contentSize[width];
  const itemSizeWidth = contentWidth / loopCount;
  const sizeWidth = size[width];
  const bufferWidth = 0.5 * (itemSizeWidth - sizeWidth);
  const maxOffsetX = -bufferWidth;
  const minOffsetX = -contentWidth + sizeWidth + bufferWidth;

  let offsetX = contentOffset[x];

  if (offsetX < minOffsetX) {
    offsetX += contentWidth - itemSizeWidth;
  } else if (maxOffsetX < offsetX) {
    offsetX -= contentWidth - itemSizeWidth;
  }

  if (offsetX !== contentOffset[x]) {
    return [
      { [x]: offsetX, [y]: contentOffset[y] },
      contentOffset[x] < offsetX ? 1 : -1,
    ];
  }

  return [contentOffset, 0];
}
