import React from 'react';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    loop: true,
    onSlideChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      loopContentSize: { width: 0, height: 0 },
    };
  }

  componentDidUpdate(prevProps, prevState) {}

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
    const { loopContentSize } = this.state;

    return (
      <Player {...playerProps} onFrameChange={this._onSlideChange}>
        {player => {
          this.playerRef = player;

          if (loop) {
            const pad = player.padRef;
            const { direction } = playerProps;

            let padContentSize = {
              width: playerProps.contentWidth,
              height: playerProps.contentHeight,
            };
            let visibleRect = { x: 0, y: 0, width: 0, height: 0 };
            let itemWidth, itemHeight;

            if (pad) {
              padContentSize = pad.getContentSize();
              visibleRect = pad.getVisibleRect();
            }

            const {
              width: calculatedWidth,
              height: calculatedHeight,
            } = loopContentSize;
            const {
              width: contentWidth,
              height: contentHeight,
            } = padContentSize;

            if (direction === 'x') {
              itemWidth =
                calculatedWidth === contentWidth
                  ? contentWidth / 2
                  : contentWidth;
              itemHeight = contentHeight;
            } else {
              itemWidth = contentWidth;
              itemHeight =
                calculatedHeight === contentHeight
                  ? contentHeight / 2
                  : contentHeight;
            }

            return (
              <ListContent
                direction={direction}
                height={padContentSize.height}
                estimatedItemWidth={itemWidth}
                estimatedItemHeight={itemHeight}
                itemCount={2}
                renderItem={() => {
                  return (
                    <div
                      style={{
                        position: 'relative',
                        width: itemWidth,
                        height: itemHeight,
                      }}
                    >
                      {typeof children === 'function'
                        ? children(this)
                        : children}
                    </div>
                  );
                }}
                visibleRect={visibleRect}
                onResize={size => {
                  player.padRef.setContentSize(size);
                  this.setState({ loopContentSize: size });
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
