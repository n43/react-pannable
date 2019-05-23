import React from 'react';
import Player from './Player';
import GridContent from '../GridContent';

export default class Carousel extends React.Component {
  static defaultProps = {
    ...Player.defaultProps,
    itemCount: 0,
    renderItem: () => null,
    onSlideChange: () => {},
  };

  state = {
    activeIndex: 0,
  };

  playerRef = React.createRef();

  componentDidUpdate(prevProps, prevState) {
    const { onSlideChange, itemCount } = this.props;
    const { activeIndex } = this.state;

    if (prevState.activeIndex !== activeIndex) {
      onSlideChange({ itemCount, activeIndex });
    }
  }

  getActiveIndex() {
    return this.state.activeIndex;
  }

  slideTo({ index, animated }) {
    const player = this.playerRef.current;
    const { activeIndex } = this.state;

    player.go({ delta: index - activeIndex, animated });
  }

  slidePrev() {
    this.playerRef.current.rewind();
  }

  slideNext() {
    this.playerRef.current.forward();
  }

  _onPlayerScroll = evt => {
    const { contentOffset, size, contentSize } = evt;
    const { direction, itemCount } = this.props;

    const nextActiveIndex = calculateActiveIndex(
      contentOffset,
      size,
      contentSize,
      itemCount,
      direction
    );

    if (nextActiveIndex !== this.state.activeIndex) {
      this.setState({ activeIndex: nextActiveIndex });
    }

    this.props.onScroll(evt);
  };

  render() {
    const { itemCount, renderItem, onSlideChange, ...playerProps } = this.props;
    const { width, height, direction } = playerProps;

    const gridProps = {
      width,
      height,
      itemWidth: width,
      itemHeight: height,
      direction,
      itemCount,
      renderItem,
    };

    playerProps.onScroll = this._onPlayerScroll;

    return (
      <Player {...playerProps} ref={this.playerRef}>
        <GridContent {...gridProps} />
      </Player>
    );
  }
}

function calculateActiveIndex(offset, size, cSize, itemCount, direction) {
  const [width, x] = direction === 'y' ? ['height', 'y'] : ['width', 'x'];

  const offsetX = Math.min(Math.max(-cSize[width], offset[x]), 0);
  const index = Math.round(-offsetX / size[width]);

  return index % itemCount;
}
