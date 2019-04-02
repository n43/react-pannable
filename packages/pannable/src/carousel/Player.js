import React from 'react';
import Pad from '../Pad';

export default class Player extends React.Component {
  static defaultProps = {
    direction: 'y',
    autoplayEnabled: true,
    autoplayInterval: 3000,
    onFrameChange: () => {},
  };

  constructor(props) {
    super(props);

    const size = {
      width: props.width || 0,
      height: props.height || 0,
    };
    const contentSize = {
      width: props.contentWidth || 0,
      height: props.contentHeight || 0,
    };
    const pageCount = calculatePageCount({
      direction: props.direction,
      size,
      contentSize,
    });

    this.state = {
      size,
      contentSize,
      contentOffset: { x: 0, y: 0 },
      touchDirection: 0,
      autoplayStatus: props.autoplayEnabled ? 1 : -1,
      pageCount,
      activeIndex: 0,
      dragging: false,
      decelerating: false,
      mouseEntered: false,
    };

    this._decelerateTimestamp = 0;
  }

  componentDidMount() {
    const { autoplayStatus } = this.state;

    if (autoplayStatus !== -1) {
      this._play();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      direction,
      autoplayEnabled,
      onFrameChange,
      onResize,
      onContentResize,
    } = this.props;
    const {
      size,
      contentSize,
      autoplayStatus,
      pageCount,
      activeIndex,
      dragging,
      decelerating,
      mouseEntered,
    } = this.state;

    if (prevProps.autoplayEnabled !== autoplayEnabled) {
      this.setState({ autoplayStatus: autoplayEnabled ? 1 : -1 });
    }

    if (
      prevProps.direction !== direction ||
      prevState.size !== size ||
      prevState.contentSize !== contentSize
    ) {
      if (prevState.size !== size && onResize) {
        onResize(size);
      }
      if (prevState.contentSize !== contentSize && onContentResize) {
        onContentResize(contentSize);
      }
    }

    if (
      prevState.autoplayStatus !== autoplayStatus ||
      prevState.dragging !== dragging ||
      prevState.mouseEntered !== mouseEntered
    ) {
      if (autoplayStatus !== -1 && !dragging && !mouseEntered) {
        if (!this._autoplayTimer) {
          this._play();
        }
      } else {
        this._pause();
      }
    }

    if (prevState.activeIndex !== activeIndex) {
      onFrameChange({ activeIndex, pageCount });
    }

    if (prevState.decelerating !== decelerating) {
      if (decelerating) {
        this._decelerateTimestamp = new Date().getTime();
      }
    }
  }

  componentWillUnmount() {
    this._pause();
  }

  getPageCount() {
    return this.state.pageCount;
  }

  getActiveIndex() {
    return this.state.activeIndex;
  }

  setFrame({ index, animated = true }) {
    const { direction } = this.props;
    const { size, pageCount } = this.state;
    const pad = this.padRef;
    const contentOffset = pad.getContentOffset();
    let offset;

    if (index < 0 || index >= pageCount) {
      return;
    } else if (index === 0) {
      offset = { x: 0, y: 0 };
    } else {
      offset = {
        x: direction === 'x' ? -(index * size.width) : contentOffset.x,
        y: direction === 'x' ? contentOffset.y : -(index * size.height),
      };
    }

    pad.scrollTo({ offset, animated });
  }

  rewind() {
    const { activeIndex } = this.state;
    this.setFrame({ index: activeIndex - 1 });
  }

  forward() {
    const { activeIndex } = this.state;
    this.setFrame({ index: activeIndex + 1 });
  }

  startAutoplay() {
    if (this.state.autoplayStatus === -1) {
      this.setState({ autoplayStatus: 1 });
    }
  }

  stopAutoplay() {
    if (this.state.autoplayStatus !== -1) {
      this.setState({ autoplayStatus: -1 });
    }
  }

  _play() {
    const { autoplayInterval } = this.props;
    const { activeIndex, pageCount } = this.state;
    const now = new Date().getTime();

    if (this._autoplayTimer) {
      if (now - this._decelerateTimestamp >= autoplayInterval) {
        if (activeIndex < pageCount - 1) {
          this.forward();
        } else {
          this.setFrame({ index: 0 });
        }
      }
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this._play();
    }, autoplayInterval);
  }

  _pause() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
      this._decelerateTimestamp = 0;
    }
  }

  _onPadResize = size => {
    this._setStateWithResize({ size });
  };

  _onPadContentResize = contentSize => {
    this._setStateWithResize({ contentSize });
  };

  _setStateWithResize(nextState) {
    this.setState((state, props) => {
      const { pageCount } = state;
      const { direction } = props;
      let size = state.size,
        contentSize = state.contentSize;

      if (nextState.size) {
        size = nextState.size;
      }
      if (nextState.contentSize) {
        contentSize = nextState.contentSize;
      }

      const nextPageCount = calculatePageCount({
        direction,
        size,
        contentSize,
      });
      if (nextPageCount !== pageCount) {
        nextState.pageCount = nextPageCount;
      }

      return nextState;
    });
  }

  _onPadScroll = evt => {
    const { contentOffset, size, dragging, decelerating } = evt;
    const { direction, onScroll } = this.props;
    const [x, width] = direction === 'x' ? ['x', 'width'] : ['y', 'height'];
    let nextState = {};
    let touchDirection = 0;

    nextState.contentOffset = contentOffset;

    if (this.state.dragging !== dragging) {
      nextState.dragging = dragging;
    }
    if (this.state.decelerating !== decelerating) {
      nextState.decelerating = decelerating;
    }

    if (!(this.state.decelerating && !decelerating)) {
      touchDirection =
        contentOffset[x] - this.state.contentOffset[x] > 0 ? 1 : -1;
    }
    nextState.touchDirection = touchDirection;

    const activeIndex =
      touchDirection === -1
        ? Math.abs(Math.floor(-contentOffset[x] / size[width]))
        : Math.abs(Math.ceil(-contentOffset[x] / size[width]));

    if (activeIndex !== this.state.activeIndex && !decelerating) {
      nextState.activeIndex = activeIndex;
    }

    this.setState(nextState);

    if (onScroll) {
      onScroll(evt);
    }
  };

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

    return (
      <Pad
        {...padProps}
        {...bounceConfig}
        pagingEnabled={true}
        onScroll={this._onPadScroll}
        onResize={this._onPadResize}
        onContentResize={this._onPadContentResize}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
      >
        {pad => {
          this.padRef = pad;
          return typeof children === 'function' ? children(this) : children;
        }}
      </Pad>
    );
  }
}

function calculatePageCount({ direction, size, contentSize }) {
  const dt = direction === 'x' ? 'width' : 'height';

  return size[dt] ? Math.round(contentSize[dt] / size[dt]) : 0;
}
