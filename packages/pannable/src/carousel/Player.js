import React from 'react';
import Pad from '../Pad';

export default class Player extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    autoplayEnabled: true,
    autoplayInterval: 3000,
  };

  constructor(props) {
    super(props);

    this.state = {
      pageCount: 0,
      activeIndex: 0,
      dragging: false,
      decelerating: false,
      mouseEntered: false,
    };
    this.padRef = React.createRef();
  }

  componentDidMount() {
    const { direction, autoplayEnabled } = this.props;
    const pad = this.padRef.current;

    const size = pad.getSize();
    const contentSize = pad.getContentSize();
    const pageCount = calculatePageCount({
      direction,
      size,
      contentSize,
    });
    this.setState({ pageCount });

    if (autoplayEnabled) {
      this.play();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      direction,
      width,
      height,
      contentWidth,
      contentHeight,
      autoplayEnabled,
    } = this.props;
    const {
      pageCount,
      activeIndex,
      dragging,
      decelerating,
      mouseEntered,
    } = this.state;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.contentWidth !== contentWidth ||
      prevProps.height !== height ||
      prevProps.contentHeight !== contentHeight
    ) {
      const pad = this.padRef.current;
      const size = pad.getSize();
      const contentSize = pad.getContentSize();
      const nextPageCount = calculatePageCount(direction, size, contentSize);

      if (nextPageCount !== pageCount) {
        this.setState({ pageCount: nextPageCount });
      }
    }

    if (
      prevProps.autoplayEnabled !== autoplayEnabled ||
      prevState.dragging !== dragging ||
      prevState.decelerating !== decelerating ||
      prevState.activeIndex !== activeIndex ||
      prevState.mouseEntered !== mouseEntered
    ) {
      if (
        autoplayEnabled &&
        !dragging &&
        !mouseEntered &&
        !decelerating &&
        pageCount > activeIndex + 1
      ) {
        this.play();
      } else {
        this.pause();
      }

      // if (prevState.activeIndex !== activeIndex && onFrameChange) {
      //   onFrameChange(activeIndex);
      // }
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
    if (this._autoplayTimer) {
      this.forward();
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
    }
  }

  setFrame(index, animated = true) {
    const { direction } = this.props;
    const pad = this.padRef.current;
    const contentOffset = pad.getContentOffset();
    const size = pad.getSize();
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
    this.setFrame(activeIndex - 1);
  }

  forward() {
    const { activeIndex } = this.state;
    this.setFrame(activeIndex + 1);
  }

  _onPadResize = size => {
    const { direction, onResize } = this.props;
    const { pageCount } = this.state;
    const pad = this.padRef.current;
    const contentSize = pad.getContentSize();

    const nextPageCount = calculatePageCount({
      direction,
      size,
      contentSize,
    });

    if (nextPageCount !== pageCount) {
      this.setState({ pageCount: nextPageCount });
    }

    if (onResize) {
      onResize(size);
    }
  };

  _onPadContentResize = contentSize => {
    const { direction, onContentResize } = this.props;
    const { pageCount } = this.state;
    const pad = this.padRef.current;
    const size = pad.getSize();

    const nextPageCount = calculatePageCount({
      direction,
      size,
      contentSize,
    });

    if (nextPageCount !== pageCount) {
      this.setState({ pageCount: nextPageCount });
    }

    if (onContentResize) {
      onContentResize(contentSize);
    }
  };

  _onPadScroll = evt => {
    const { contentOffset, size, dragging, decelerating } = evt;
    const { direction, onScroll } = this.props;
    const [x, width] = direction === 'x' ? ['x', 'width'] : ['y', 'height'];
    const activeIndex = Math.abs(Math.floor(contentOffset[x] / size[width]));

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
        ref={this.padRef}
        {...padProps}
        {...bounceConfig}
        pagingEnabled={true}
        onScroll={this._onPadScroll}
        onResize={this._onPadResize}
        onContentResize={this._onPadContentResize}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
      >
        {typeof children === 'function' ? children(this) : children}
      </Pad>
    );
  }
}

function calculatePageCount({ direction, size, contentSize }) {
  const dt = direction === 'x' ? 'width' : 'height';

  return size[dt] ? Math.round(contentSize[dt] / size[dt]) : 0;
}
