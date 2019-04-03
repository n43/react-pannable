import React from 'react';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.Component {
  static defaultProps = {
    direction: 'x',
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

  // getActiveIndex() {
  //   const { loop } = this.props;
  //   const player = this.playerRef;
  //   const activeIndex = player.getActiveIndex();
  //   const pageCount = player.getPageCount();

  //   if (loop) {
  //     return this._calculateActiveSlideForLoop({ activeIndex, pageCount });
  //   }

  //   return activeIndex;
  // }

  // getVisibleRect() {
  //   const { loop, direction } = this.props;
  //   const player = this.playerRef;
  //   const pad = player.padRef;
  //   const activeIndex = player.getActiveIndex();
  //   const pageCount = player.getPageCount();
  //   const contentSize = pad.getContentSize();
  //   const visibleRect = pad.getVisibleRect();

  //   if (!loop || pageCount === 0 || activeIndex < pageCount / 2) {
  //     return visibleRect;
  //   }

  //   let visibleRectForLoop = { ...visibleRect };
  //   const [width, x] = direction === 'x' ? ['width', 'x'] : ['height', 'y'];
  //   visibleRectForLoop[x] = visibleRectForLoop[x] - contentSize[width] / 2;

  //   return visibleRectForLoop;
  // }

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

  _onSlideChange = () => {
    const { loop, onSlideChange } = this.props;

    if (loop) {
      // activeSlide = this._calculateActiveSlideForLoop({
      //   activeIndex,
      //   pageCount,
      // });
      this._alternateFramesForLoop();
    }

    // onSlideChange({ activeIndex: activeSlide, pageCount });
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

  _alternateFramesForLoop() {
    const { direction } = this.props;
    const player = this.playerRef;
    const pad = player.padRef;
    const contentSize = pad.getContentSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    const min = parseFloat(contentSize[width] / 4);
    const max = parseFloat((contentSize[width] * 3) / 4);

    if (contentOffset[x] < min || contentOffset[x] >= max) {
      let m = contentOffset[x] < min ? 1 : -1;
      const offsetX = contentOffset[x] + (contentSize[width] / 2) * m;
      player.setFrame({
        offset: { [x]: offsetX, [y]: 0 },
        animated: false,
      });
    }
  }

  render() {
    const { loop, children, onSlideChange, ...playerProps } = this.props;
    const { direction } = playerProps;

    return (
      <Player {...playerProps} onScroll={this._onSlideChange}>
        {player => {
          this.playerRef = player;
          const pad = player.padRef;

          if (!pad) {
            return null;
          }
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
                renderItem={() => {
                  return { element };
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
