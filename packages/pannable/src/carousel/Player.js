import React from 'react';
import Pad from '../Pad';

export default class Player extends React.PureComponent {
  static defaultProps = {
    children: null,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    direction: 'vertical',
    autoplayEnabled: true,
    autoplayDelay: 3000,
  };

  constructor(props) {
    super(props);

    const { width, height, contentWidth, contentHeight, direction } = props;
    let pageCount = 0;

    if (direction === 'horizontal') {
      pageCount = width ? Math.round(contentWidth / width) : 0;
    } else {
      pageCount = height ? Math.round(contentHeight / height) : 0;
    }

    this.state = {
      pageCount,
      activeIndex: 0,
      dragging: false,
      prevDragging: false,
    };
    this.padRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const { dragging, prevDragging } = state;
    let nextState = {};

    if (prevDragging !== dragging) {
      nextState.dragging = dragging;
      nextState.prevDragging = dragging;
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
    const { pageCount, activeIndex, dragging } = this.state;

    if (
      (prevProps.width !== width || prevProps.contentWidth !== contentWidth) &&
      direction === 'horizontal'
    ) {
      this.setState({
        pageCount: width ? Math.round(contentWidth / width) : 0,
      });
    }

    if (
      (prevProps.height !== height ||
        prevProps.contentHeight !== contentHeight) &&
      direction !== 'horizontal'
    ) {
      this.setState({
        pageCount: height ? Math.round(contentHeight / height) : 0,
      });
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
    const { autoplayDelay } = this.props;

    if (this._autoplayTimer) {
      this.forward();
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this.play();
    }, autoplayDelay);
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
    const { width, height, contentWidth, contentHeight, children } = this.props;

    return (
      <Pad
        ref={this.padRef}
        width={width}
        height={height}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
        pagingEnabled={true}
        onScroll={this._onPadScroll}
      >
        {typeof children === 'function'
          ? children(this.padRef.current)
          : children}
      </Pad>
    );
  }
}
