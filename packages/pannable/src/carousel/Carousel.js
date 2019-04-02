import React from 'react';
import Player from './Player';

export default class Carousel extends React.Component {
  static defaultProps = {
    direction: 'y',
    loop: true,
    onSlideChange: () => {},
  };

  constructor(props) {
    super(props);

    let contentSize = {
      width: props.contentWidth || 0,
      height: props.contentHeight || 0,
    };

    const layout = calculateLayout(props, contentSize);

    this.state = {
      size: { width: props.width || 0, height: props.height || 0 },
      contentSize: layout.contentSize,
      layoutList: layout.layoutList,
    };
  }

  componentDidMount() {
    const { direction, loop } = this.props;
    const { contentSize } = this.state;
    const dt = direction === 'x' ? 'width' : 'height';

    if (loop && contentSize[dt] > 0) {
      const player = this.playerRef;
      const activeIndex = player.getActiveIndex();
      const pageCount = player.getPageCount();
      this._alternateFramesForLoop({ activeIndex, pageCount });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { size, contentSize } = this.state;
    const { loop, direction } = this.props;

    if (prevState.size !== size || prevState.contentSize !== contentSize) {
      const dt = direction === 'x' ? 'width' : 'height';

      if (loop && contentSize[dt] > 0) {
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
    const { contentSize } = this.state;
    const player = this.playerRef;
    const activeIndex = player.getActiveIndex();
    const pageCount = player.getPageCount();
    const visibleRect = player.padRef.getVisibleRect();

    if (!loop || pageCount === 0 || activeIndex < pageCount / 2) {
      return visibleRect;
    }

    let visibleRectForLoop = { ...visibleRect };
    const [width, x] = direction === 'x' ? ['width', 'x'] : ['height', 'y'];
    visibleRectForLoop[x] = visibleRectForLoop[x] - contentSize[width] / 2;

    return visibleRectForLoop;
  }

  setContentSize(contentSize) {
    const layout = calculateLayout(this.props, contentSize);
    this.setState({
      layoutList: layout.layoutList,
      contentSize: layout.contentSize,
    });
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
    // const { size: prevSize } = this.state;
    // if (prevSize.width !== size.width || prevSize.height !== size.height) {
    //   this.setState({ size });
    // }
  };

  _onPlayerContentResize = contentSize => {
    // const { contentSize: prevContentSize } = this.state;
    // if (
    //   prevContentSize.width !== contentSize.width ||
    //   prevContentSize.height !== contentSize.height
    // ) {
    //   this.setState({ contentSize });
    // }
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
    const { size, contentSize, layoutList } = this.state;

    return (
      <Player
        {...playerProps}
        width={size.width}
        height={size.height}
        contentWidth={contentSize.width}
        contentHeight={contentSize.height}
        onFrameChange={this._onSlideChange}
        onResize={this._onPlayerResize}
        onContentResize={this._onPlayerContentResize}
      >
        {player => {
          this.playerRef = player;

          return layoutList.map(({ width, height, x, y }, index) => {
            const style = {
              position: 'absolute',
              top: y,
              left: x,
              width,
              height,
            };
            return (
              <div style={style} key={index}>
                {typeof children === 'function' ? children(this) : children}
              </div>
            );
          });
        }}
      </Player>
    );
  }
}

function calculateLayout(props, contentSize) {
  const { direction, loop } = props;
  let layoutList = [];
  layoutList.push({
    position: 'absolute',
    x: 0,
    y: 0,
    width: contentSize.width,
    height: contentSize.height,
  });

  if (!loop) {
    return { contentSize, layoutList };
  }

  const [width, height, x, y] =
    direction === 'x'
      ? ['width', 'height', 'x', 'y']
      : ['height', 'width', 'y', 'x'];

  layoutList.push({
    [x]: contentSize[width],
    [y]: 0,
    [width]: contentSize[width],
    [height]: contentSize[height],
  });
  const calculatedSize = {
    ...contentSize,
    [width]: contentSize[width] * 2,
  };

  return { contentSize: calculatedSize, layoutList };
}
