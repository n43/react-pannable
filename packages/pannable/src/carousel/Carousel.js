import React from 'react';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    loop: true,
    onSlideChange: () => {},
  };

  state = {
    size: { width: 0, height: 0 },
    contentSize: { width: 0, height: 0 },
    calculatedSizeForLoop: { width: 0, height: 0 },
  };

  componentDidUpdate(prevProps, prevState) {
    const { size, contentSize } = this.state;
    const { loop } = this.props;

    if (prevState.size !== size || prevState.contentSize !== contentSize) {
      if (loop) {
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
    const { calculatedSizeForLoop } = this.state;

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
            const padContentSize = pad.getContentSize();
            const visibleRect = pad.getVisibleRect();
            let itemWidth, itemHeight;

            const {
              width: resizeWidth,
              height: resizeHeight,
            } = calculatedSizeForLoop;
            const { width: realWidth, height: realHeight } = padContentSize;

            if (direction === 'x') {
              itemWidth = resizeWidth === realWidth ? realWidth / 2 : realWidth;
              itemHeight = realHeight;
            } else {
              itemWidth = realWidth;
              itemHeight =
                resizeHeight === realHeight ? realHeight / 2 : realHeight;
            }

            return (
              <ListContent
                direction={direction}
                width={realWidth}
                height={realHeight}
                itemCount={2}
                renderItem={({ Item }) => (
                  <Item width={itemWidth} height={itemHeight}>
                    {typeof children === 'function' ? children(this) : children}
                  </Item>
                )}
                visibleRect={visibleRect}
                onResize={size => {
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
