import React from 'react';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.Component {
  static defaultProps = {
    direction: 'y',
    loop: true,
    onSlideChange: () => {},
  };

  componentDidMount() {
    // const { direction, loop } = this.props;
    // // const { contentSize } = this.state;
    // const dt = direction === 'x' ? 'width' : 'height';
    // if (loop && contentSize[dt] > 0) {
    //   const player = this.playerRef;
    //   const activeIndex = player.getActiveIndex();
    //   const pageCount = player.getPageCount();
    //   this._alternateFramesForLoop({ activeIndex, pageCount });
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    // const { size, contentSize } = this.state;
    // const { loop, direction } = this.props;
    // if (prevState.size !== size || prevState.contentSize !== contentSize) {
    //   const dt = direction === 'x' ? 'width' : 'height';
    //   if (loop && contentSize[dt] > 0) {
    //     const player = this.playerRef;
    //     const activeIndex = player.getActiveIndex();
    //     const pageCount = player.getPageCount();
    //     this._alternateFramesForLoop({ activeIndex, pageCount });
    //   }
    // }
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
    const player = this.playerRef;
    const pad = player.padRef;
    const activeIndex = player.getActiveIndex();
    const pageCount = player.getPageCount();
    const contentSize = pad.getContentSize();
    const visibleRect = pad.getVisibleRect();

    if (!loop || pageCount === 0 || activeIndex < pageCount / 2) {
      return visibleRect;
    }

    let visibleRectForLoop = { ...visibleRect };
    const [width, x] = direction === 'x' ? ['width', 'x'] : ['height', 'y'];
    visibleRectForLoop[x] = visibleRectForLoop[x] - contentSize[width] / 2;

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

  _onLoopItemResize = contentSize => {
    const { direction } = this.props;
    const [width, height] =
      direction === 'x' ? ['width', 'height'] : ['height', 'width'];
    this.playerRef.padRef.setContentSize({
      [width]: contentSize[width] * 2,
      [height]: contentSize[height],
    });
  };

  _calculateActiveSlideForLoop({ activeIndex, pageCount }) {
    if (activeIndex < pageCount / 2) {
      return activeIndex;
    }

    return activeIndex - pageCount / 2;
  }

  _alternateFramesForLoop({ activeIndex, pageCount }) {
    const player = this.playerRef;
    const min = parseFloat(pageCount / 4);
    const max = parseFloat((pageCount * 3) / 4);

    if (activeIndex < min || activeIndex >= max) {
      let m = activeIndex < min ? 1 : -1;
      const nextFrame = activeIndex + (pageCount / 2) * m;
      player.setFrame({ index: nextFrame, animated: false });
    }
  }

  render() {
    const { loop, children, onSlideChange, ...playerProps } = this.props;
    const { direction } = playerProps;

    return (
      <Player {...playerProps} onFrameChange={this._onSlideChange}>
        {player => {
          this.playerRef = player;
          const pad = player.padRef;
          const size = pad.getSize();
          const visibleRect = pad.getVisibleRect();

          const element =
            typeof children === 'function' ? children(this) : children;

          if (loop) {
            return (
              <ListContent
                direction={direction}
                width={size.width}
                height={size.height}
                itemCount={2}
                renderItem={({ Item }) => {
                  return (
                    <Item onResize={this._onLoopItemResize}>{element}</Item>
                  );
                }}
                visibleRect={visibleRect}
              />
            );
          }

          return element;
        }}
      </Player>
    );
  }
}
