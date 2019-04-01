import React from 'react';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.Component {
  static defaultProps = {
    direction: 'y',
    loop: true,
    onSlideChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      size: { width: props.width || 0, height: props.height || 0 },
      contentSize: {
        width: props.contentWidth || 0,
        height: props.contentHeight || 0,
      },
      calculatedSizeForLoop: { width: 0, height: 0 },
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { size, contentSize, calculatedSizeForLoop } = this.state;
    const { loop, direction } = this.props;

    if (
      prevState.size !== size ||
      prevState.contentSize !== contentSize ||
      prevState.calculatedSizeForLoop !== calculatedSizeForLoop
    ) {
      const dt = direction === 'x' ? 'width' : 'height';

      if (loop && contentSize[dt] === calculatedSizeForLoop[dt]) {
        const player = this.playerRef;
        const activeIndex = player.getActiveIndex();
        const pageCount = player.getPageCount();

        this._alternateFramesForLoop({ activeIndex, pageCount });
      }
    }
  }

  getActiveIndex() {
    const { loop } = this.props;
    const player = this.playerRef;
    const activeIndex = player.getActiveIndex();
    const pageCount = player.getPageCount();

    if (loop) {
      return this._calculateActiveSlideForLoop({ activeIndex, pageCount });
    }

    return activeIndex;
  }

  getVisibleRect() {
    const { loop, direction } = this.props;
    const { contentSize, calculatedSizeForLoop } = this.state;
    const player = this.playerRef;
    const activeIndex = player.getActiveIndex();
    const pageCount = player.getPageCount();
    const visibleRect = player.padRef.getVisibleRect();

    if (!loop || pageCount === 0 || activeIndex < pageCount / 2) {
      // console.log('1:', visibleRect, activeIndex);
      return visibleRect;
    }

    let visibleRectForLoop = { ...visibleRect };
    const dt = direction === 'x' ? 'width' : 'height';
    const x = direction === 'x' ? 'x' : 'y';

    if (contentSize[dt] !== calculatedSizeForLoop[dt]) {
      // console.log('2:', visibleRect);
      return visibleRect;
    }

    visibleRectForLoop[x] = visibleRectForLoop[x] - contentSize / 2;

    // console.log('3:', visibleRectForLoop, activeIndex);
    return visibleRectForLoop;
  }

  slideTo({ index, animated = true }) {
    const player = this.playerRef;
    const activeIndex = player.getActiveIndex();
    const pageCount = player.getPageCount();

    if (index > pageCount / 2 - 1) {
      return;
    }

    if (activeIndex >= pageCount / 2) {
      index = pageCount / 2 + index;
    }

    player.setFrame({ index, animated });
  }

  slidePrev() {
    const player = this.playerRef;

    player.rewind();
  }

  slideNext() {
    const player = this.playerRef;

    player.forward();
  }

  _onSlideChange = ({ activeIndex, pageCount }) => {
    const { loop, onSlideChange } = this.props;
    let activeSlide = activeIndex;

    if (loop) {
      activeSlide = this._calculateActiveSlideForLoop({
        activeIndex,
        pageCount,
      });
      this._alternateFramesForLoop({ activeIndex, pageCount });
    }

    onSlideChange({ activeIndex: activeSlide, pageCount });
  };

  _onPlayerResize = size => {
    this.setState({ size });
  };

  _onPlayerContentResize = contentSize => {
    this.setState({ contentSize });
  };

  _calculateActiveSlideForLoop({ activeIndex, pageCount }) {
    if (activeIndex < pageCount / 2) {
      return activeIndex;
    }

    return activeIndex - pageCount / 2;
  }

  _alternateFramesForLoop({ activeIndex, pageCount }) {
    const player = this.playerRef;

    if (activeIndex < pageCount / 2 - 1 || activeIndex > pageCount - 2) {
      let m = activeIndex > pageCount - 2 ? -1 : 1;
      const nextFrame = activeIndex + (pageCount / 2) * m;
      player.setFrame({ index: nextFrame, animated: false });
    }
  }

  render() {
    const { loop, children, onSlideChange, ...playerProps } = this.props;
    const { size, contentSize, calculatedSizeForLoop } = this.state;

    return (
      <Player
        {...playerProps}
        onFrameChange={this._onSlideChange}
        onResize={this._onPlayerResize}
        onContentResize={this._onPlayerContentResize}
      >
        {player => {
          this.playerRef = player;

          if (loop) {
            const { direction } = playerProps;
            const visibleRect = player.padRef.getVisibleRect();

            return (
              <ListContent
                direction={direction}
                width={size.width}
                height={size.height}
                itemCount={2}
                renderItem={({ Item }) => {
                  return typeof children === 'function'
                    ? children(this, Item)
                    : children;
                }}
                visibleRect={visibleRect}
                onResize={size => {
                  console.log('onresize:', size);
                  this.setState({ calculatedSizeForLoop: size });
                  player.padRef.setContentSize(size);
                }}
              />
            );
          }

          return typeof children === 'function' ? children(this) : children;
        }}
      </Player>
    );
  }
}
