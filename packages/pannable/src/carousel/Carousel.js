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
    const { contentSize, calculatedSizeForLoop } = this.state;

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
            const pad = player.padRef;
            const { direction } = playerProps;
            const visibleRect = pad.getVisibleRect();
            let itemWidth, itemHeight;

            const {
              width: loopWidth,
              height: loopHeight,
            } = calculatedSizeForLoop;
            const { width: contentWidth, height: contentHeight } = contentSize;

            if (direction === 'x') {
              itemWidth =
                loopWidth === contentWidth ? contentWidth / 2 : contentWidth;
              itemHeight = contentHeight;
            } else {
              itemWidth = contentWidth;
              itemHeight =
                loopHeight === contentHeight
                  ? contentHeight / 2
                  : contentHeight;
            }

            return (
              <ListContent
                direction={direction}
                width={contentWidth}
                height={contentHeight}
                itemCount={2}
                renderItem={({ Item }) => (
                  <Item width={itemWidth} height={itemHeight}>
                    {typeof children === 'function' ? children(this) : children}
                  </Item>
                )}
                visibleRect={visibleRect}
                onResize={size => {
                  console.log('loop:', size);
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
