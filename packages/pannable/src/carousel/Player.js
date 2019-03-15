import React from 'react';
import Pad from '../Pad';

export default class Player extends React.PureComponent {
  static defaultProps = {
    direction: 'vertical',
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
      pageCount,
      activeIndex: 0,
      dragging: false,
      decelerating: false,
    };
    this.padRef = React.createRef();
  }

  // static getDerivedStateFromProps(props, state) {
  //   const { dragging, prevDragging } = state;
  //   let nextState = {};

  //   return nextState;
  // }

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
    const { pageCount, activeIndex, dragging, decelerating } = this.state;

    if (
      prevProps.direction !== direction ||
      prevProps.width !== width ||
      prevProps.contentWidth !== contentWidth ||
      prevProps.height !== height ||
      prevProps.contentHeight !== contentHeight
    ) {
      const padDt = direction === 'horizontal' ? width : height;
      const contentDt =
        direction === 'horizontal' ? contentWidth : contentHeight;
      const nextPageCount = padDt ? Math.round(contentDt / padDt) : 0;

      if (nextPageCount !== pageCount) {
        this.setState({ pageCount: nextPageCount });
      }
    }

    if (
      prevProps.autoplayEnabled !== autoplayEnabled ||
      prevState.dragging !== dragging
    ) {
      if (autoplayEnabled && !dragging) {
        this.play();
      } else {
        this.pause();
      }
    }

    if (
      prevState.activeIndex !== activeIndex ||
      prevState.decelerating !== decelerating
    ) {
      if (!decelerating && pageCount === activeIndex + 1) {
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
    console.log('play');
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
    const offset = {
      x: direction === 'horizontal' ? -(index * width) : contentOffset.x,
      y: direction === 'horizontal' ? contentOffset.y : -(index * height),
    };
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
    const [x, width] =
      direction === 'horizontal' ? ['x', 'width'] : ['y', 'height'];
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

  render() {
    const {
      direction,
      autoplayEnabled,
      autoplayInterval,
      children,
      ...padProps
    } = this.props;

    return (
      <Pad
        ref={this.padRef}
        {...padProps}
        pagingEnabled={true}
        onScroll={this._onPadScroll}
      >
        {typeof children === 'function' ? children(this) : children}
      </Pad>
    );
  }
}

function calculatePageCount({ direction, size, contentSize }) {
  const dt = direction === 'horizontal' ? 'width' : 'height';

  return size[dt] ? Math.round(contentSize[dt] / size[dt]) : 0;
}
