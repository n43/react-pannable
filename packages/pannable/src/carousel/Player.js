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
      prevDragging: false,
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
    const { pageCount, activeIndex, dragging } = this.state;

    if (
      prevProps.width !== width ||
      prevProps.height !== height ||
      prevProps.contentWidth !== contentWidth ||
      prevProps.contentHeight !== contentHeight
    ) {
      const pageCount = calculatePageCount({
        direction,
        size: { width, height },
        contentSize: { width: contentWidth, height: contentHeight },
      });
      this.setState({ pageCount });
    }

    if (prevProps.direction !== direction) {
      const pageCount = calculatePageCount({
        direction,
        size: { width, height },
        contentSize: { width: contentWidth, height: contentHeight },
      });
      this.setState({ pageCount, activeIndex: 0 });
    }

    if (prevProps.autoplayEnabled !== autoplayEnabled) {
      if (autoplayEnabled) {
        this.play();
      } else {
        this.pause();
      }
    }

    if (prevState.dragging !== dragging) {
      if (autoplayEnabled) {
        if (!dragging) {
          this.play();
        } else {
          this.pause();
        }
      }
    }

    if (prevState.activeIndex !== activeIndex) {
      if (pageCount === activeIndex + 1) {
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

  _onPadScroll = ({ contentOffset, size, dragging }) => {
    const { direction } = this.props;
    const [x, width] =
      direction === 'horizontal' ? ['x', 'width'] : ['y', 'height'];
    const activeIndex = Math.abs(Math.floor(contentOffset[x] / size[width]));
    this.setState({ activeIndex, dragging });
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
