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
    scrollsBackOnEdge: true,
    pagingEnabled: true,
  };

  constructor(props) {
    super(props);

    this.state = { mouseEntered: false, loopCount: 1 };
    this.padRef = React.createRef();
  }

  componentDidMount() {
    this._tryStartPlaying();
  }

  componentDidUpdate(prevProps, prevState) {
    const { autoplayEnabled, autoplayInterval } = this.props;
    const { mouseEntered } = this.state;

    if (
      autoplayEnabled !== prevProps.autoplayEnabled ||
      autoplayInterval !== prevProps.autoplayInterval
    ) {
      this._stopPlaying();
      this._tryStartPlaying();
    }
    if (mouseEntered !== prevState.mouseEntered) {
      if (mouseEntered) {
        this._stopPlaying();
      } else {
        this._tryStartPlaying();
      }
    }
  }

  componentWillUnmount() {
    this._stopPlaying();
  }

  go(delta) {
    const { direction, scrollsBackOnEdge } = this.props;
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
          offsetX = scrollsBackOnEdge ? minOffsetX : 0;
        } else if (offsetX < minOffsetX) {
          offsetX = scrollsBackOnEdge ? 0 : minOffsetX;
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

  _tryStartPlaying() {
    if (!this.props.autoplayEnabled) {
      return;
    }

    if (this.state.mouseEntered) {
      return;
    }

    const pad = this.padRef.current;

    if (!pad || pad.isDragging() || pad.isDecelerating()) {
      return;
    }

    this._startPlaying();
  }

  _startPlaying() {
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
    this._tryStartPlaying();

    this.props.onDragEnd();
  };

  _onPadDecelerationStart = () => {
    this._stopPlaying();

    this.props.onDecelerationStart();
  };

  _onPadDecelerationEnd = () => {
    this._tryStartPlaying();

    this.props.onDecelerationEnd();
  };

  _onPadScroll = evt => {
    const { loopCount } = this.state;

    if (loopCount) {
      this._adjustContentOffsetForLoop(evt);
    }

    this.props.onScroll(evt);
  };

  _adjustContentOffsetForLoop() {
    const { direction } = this.props;
    const { loopCount } = this.state;
    const pad = this.padRef.current;

    pad.scrollTo({
      offset: state => {
        const { contentOffset, size, contentSize } = state;
        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        const offsetRange = contentSize[width] / loopCount;
        const maxOffsetX = 0;
        const minOffsetX = Math.min(size[width] - contentSize[width], 0);

        let offsetX = contentOffset[x];
        if (offsetX <= minOffsetX) {
          offsetX += offsetRange;
        } else if (maxOffsetX < offsetX) {
          offsetX -= offsetRange;
        }

        if (offsetX === contentOffset[x]) {
          return null;
        }
        return { [x]: offsetX, [y]: contentOffset[y] };
      },
      animated: false,
    });
  }

  _onPadMouseEnter = evt => {
    const { onMouseEnter } = this.props;

    this.setState({ mouseEntered: true });

    if (onMouseEnter) {
      onMouseEnter(evt);
    }
  };

  _onPadMouseLeave = evt => {
    const { onMouseLeave } = this.props;

    this.setState({ mouseEntered: false });

    if (onMouseLeave) {
      onMouseLeave(evt);
    }
  };

  _onPadContentResize = contentSize => {
    this.setState((state, props) => {
      const { direction, loop } = props;
      const { loopCount } = state;
      let nextLoopCount = 1.0;

      if (loop) {
        const size = { width: props.width, height: props.height };
        const width = direction === 'y' ? 'height' : 'width';
        const sizeWidth = size[width];
        let contentSizeWidth = contentSize[width];

        if (loopCount) {
          contentSizeWidth = contentSizeWidth / loopCount;
        }
        if (contentSizeWidth && sizeWidth) {
          nextLoopCount += Math.ceil(sizeWidth / contentSizeWidth);
        }
      }
      console.log('LoopCount', nextLoopCount, contentSize);

      if (nextLoopCount === loopCount) {
        return null;
      }

      return {
        loopCount: nextLoopCount,
      };
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
    padProps.onScroll = this._onPadScroll;
    padProps.onDragStart = this._onPadDragStart;
    padProps.onDragEnd = this._onPadDragEnd;
    padProps.onDecelerationStart = this._onPadDecelerationStart;
    padProps.onDecelerationEnd = this._onPadDecelerationEnd;
    padProps.onMouseEnter = this._onPadMouseEnter;
    padProps.onMouseLeave = this._onPadMouseLeave;
    padProps.onContentResize = this._onPadContentResize;

    return <Pad {...padProps} ref={this.padRef} />;
  }
}
