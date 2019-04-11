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

  go(delta) {
    const { direction } = this.props;
    const pad = this.padRef.current;

    pad.scrollTo({
      offset: (state, props) => {
        const { contentOffset, size, contentSize } = state;
        const { pagingEnabled } = props;

        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        const sizeWidth = size[width];
        let minOffsetX = Math.min(sizeWidth - contentSize[width], 0);
        let offsetX = contentOffset[x] - delta * sizeWidth;

        if (pagingEnabled && sizeWidth > 0) {
          minOffsetX = size[width] * Math.ceil(minOffsetX / size[width]);
        }

        if (offsetX > 0) {
          offsetX = minOffsetX;
        } else if (offsetX < minOffsetX) {
          offsetX = 0;
        }

        return { [x]: offsetX, [y]: contentOffset[y] };
      },
      animated: true,
    });
  }

  rewind() {
    this.go(-1);
  }

  forward() {
    this.go(1);
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

  _onPadDragStart = () => {
    this._stopPlaying();

    this.props.onDragStart();
  };
  _onPadDragEnd = () => {
    this._startPlaying();

    this.props.onDragEnd();
  };
  _onPadDecelerationStart = () => {
    this._stopPlaying();

    this.props.onDecelerationStart();
  };
  _onPadDecelerationEnd = () => {
    this._startPlaying();

    this.props.onDecelerationEnd();
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
