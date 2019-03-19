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

    const { width, height, contentWidth, contentHeight, direction } = props;
    const pageCount = calculatePageCount({
      direction,
      size: { width, height },
      contentSize: { width: contentWidth, height: contentHeight },
    });

    this.state = {
      prevDirection: direction,
      pageCount,
      activeIndex: 0,
      dragging: false,
      decelerating: false,
      mouseEntered: false,
    };
    this.padRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const { direction } = props;
    const { prevDirection } = state;
    let nextState = {};

    if (prevDirection !== direction) {
      nextState.prevDirection = direction;
      nextState.activeIndex = 0;
    }

    return nextState;
  }

  componentDidMount() {
    const { autoplayEnabled } = this.props;

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
      const padDt = direction === 'x' ? width : height;
      const contentDt = direction === 'x' ? contentWidth : contentHeight;
      const nextPageCount = padDt ? Math.round(contentDt / padDt) : 0;

      if (nextPageCount !== pageCount) {
        this.setState({ pageCount: nextPageCount });
      }
      // if (prevProps.direction !== direction) {
      //   this.setFrame(0);
      // }
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
    }
  }

  componentWillUnmount() {
    this.pause();
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

  setFrame(index) {
    const { direction, width, height } = this.props;
    const pad = this.padRef.current;
    const contentOffset = pad.getContentOffset();
    let offset;

    if (index === 0) {
      offset = { x: 0, y: 0 };
    } else {
      offset = {
        x: direction === 'x' ? -(index * width) : contentOffset.x,
        y: direction === 'x' ? contentOffset.y : -(index * height),
      };
    }

    pad.scrollTo({ offset, animated: true });
  }

  rewind() {
    const { activeIndex } = this.state;
    this.setFrame(activeIndex - 1);
  }

  forward() {
    const { activeIndex } = this.state;
    this.setFrame(activeIndex + 1);
  }

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
