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

  constructor(props) {
    super(props);

    this.state = {
      activeIndex: 0,
    };

    this.playerRef = React.createRef();
  }

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
    const player = this.playerRef.current;

    player.rewind();
  }

  slideNext() {
    const player = this.playerRef.current;

    player.forward();
  }

  _onPlayerScroll = evt => {
    const { size, contentOffset } = evt;
    const nextActiveIndex = this._calculateActiveIndex({ size, contentOffset });

    if (nextActiveIndex !== this.state.activeIndex) {
      this.setState({ activeIndex: nextActiveIndex });
    }

    this.props.onScroll(evt);
  };

  _calculateActiveIndex({ size, contentOffset }) {
    const { direction, itemCount } = this.props;
    const [width, x] = direction === 'x' ? ['width', 'x'] : ['height', 'y'];
    let activeIndex = Math.max(Math.round(-contentOffset[x] / size[width]), 0);

    return activeIndex % itemCount;
  }

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

    const gridElement = <GridContent ref={this.gridRef} {...gridProps} />;
    playerProps.children = gridElement;
    playerProps.onScroll = this._onPlayerScroll;

    return <Player {...playerProps} ref={this.playerRef} />;
  }
}
