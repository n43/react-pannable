import React from 'react';
import Pad from '../Pad';

export default class Player extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    autoplayEnabled: true,
    autoplayInterval: 3000,
    onFrameChange: () => {},
  };

  state = {
    size: { width: 0, height: 0 },
    contentSize: { width: 0, height: 0 },
    pageCount: 0,
    activeIndex: 0,
    dragging: false,
    decelerating: false,
    mouseEntered: false,
  };

  _decelerateTimestamp = 0;

  componentDidMount() {
    const { autoplayEnabled } = this.props;

    if (autoplayEnabled) {
      this.play();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { direction, autoplayEnabled, onFrameChange } = this.props;
    const {
<<<<<<< HEAD
      size,
      contentSize,
      pageCount,
      activeIndex,
      dragging,
      decelerating,
      mouseEntered,
    } = this.state;
=======
      direction,
      width,
      height,
      contentWidth,
      contentHeight,
      autoplayEnabled,
      onFrameChange,
    } = this.props;
    const { pageCount, activeIndex, dragging, mouseEntered } = this.state;
>>>>>>> ceddd538713aa8eced693087f7e65944f32d9530

    if (
      prevProps.direction !== direction ||
      prevState.size !== size ||
      prevState.contentSize !== contentSize
    ) {
      const nextPageCount = calculatePageCount({
        direction,
        size,
        contentSize,
      });

      if (nextPageCount !== pageCount) {
        this.setState({ pageCount: nextPageCount });
      }
    }

    if (
      prevProps.autoplayEnabled !== autoplayEnabled ||
      prevState.dragging !== dragging ||
      prevState.mouseEntered !== mouseEntered
    ) {
      if (autoplayEnabled && !dragging && !mouseEntered) {
        if (pageCount > activeIndex + 1) {
          this.play();
        }
      } else {
        this.pause();
      }
    }

    if (prevState.activeIndex !== activeIndex) {
      if (pageCount <= activeIndex + 1) {
        this.pause();
      } else if (!this._autoplayTimer) {
        this.play();
      }
      console.log(prevState.activeIndex, activeIndex);
      onFrameChange({ activeIndex, pageCount });
    }

    if (prevState.decelerating !== decelerating) {
      if (decelerating) {
        this._decelerateTimestamp = new Date().getTime();
      }
    }
  }

  componentWillUnmount() {
    this.pause();
  }

  getPageCount() {
    return this.state.pageCount;
  }

  getActiveIndex() {
    return this.state.activeIndex;
  }

  play() {
    const { autoplayInterval } = this.props;
    const now = new Date().getTime();

    if (this._autoplayTimer) {
      if (now - this._decelerateTimestamp >= autoplayInterval) {
        this.forward();
      }
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this.play();
    }, autoplayInterval);
  }

  pause() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
      this._decelerateTimestamp = 0;
    }
  }

  setFrame({ index, animated = true }) {
    const { direction } = this.props;
    const { size } = this.state;
    const pad = this.padRef;
    const contentOffset = pad.getContentOffset();
    let offset;

    if (index === 0) {
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

  _onPadResize = size => {
    const { onResize } = this.props;

    this.setState({ size });

    if (onResize) {
      onResize(size);
    }
  };

  _onPadContentResize = contentSize => {
    const { onContentResize } = this.props;

    this.setState({ contentSize });

    if (onContentResize) {
      onContentResize(contentSize);
    }
  };

  _onPadScroll = evt => {
    const { contentOffset, size, dragging, decelerating } = evt;
    const { direction, onScroll } = this.props;
    const [x, width] = direction === 'x' ? ['x', 'width'] : ['y', 'height'];
    const activeIndex = Math.abs(Math.floor(-contentOffset[x] / size[width]));
    let nextState = { activeIndex };

    if (this.state.dragging !== dragging) {
      nextState.dragging = dragging;
    }
    if (this.state.decelerating !== decelerating) {
      nextState.decelerating = decelerating;
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
