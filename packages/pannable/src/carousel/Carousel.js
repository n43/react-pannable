import React from 'react';
import Player from './Player';

export default class Carousel extends React.Component {
  static defaultProps = {
    ...Player.defaultProps,
    renderIndicator: null,
    onSlideChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      pageCount: 0,
      activeIndex: 0,
    };

    this.playerRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    const { onSlideChange } = this.props;
    const { activeIndex } = this.state;

    if (prevState.activeIndex !== activeIndex) {
      onSlideChange(activeIndex);
    }
  }

  getActiveIndex() {
    return this.state.activeIndex;
  }

  slideTo(index) {
    const player = this.playerRef.current;
    const { pageCount, activeIndex } = this.state;

    if (index > pageCount) {
      return;
    }

    player.go(index - activeIndex);
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
    this._setActiveIndex();

    this.props.onScroll(evt);
  };

  _onPlayerContentResize = contentSize => {
    this._setPageCount();

    this.props.onContentResize(contentSize);
  };

  _setPageCount() {
    const player = this.playerRef.current;

    if (!player) {
      return;
    }

    const pad = player.padRef.current;
    const size = pad.getSize();
    const contentSize = pad.getContentSize();

    this.setState((state, props) => {
      const { loop, direction } = props;
      const width = direction === 'x' ? 'width' : 'height';
      let pageCount = Math.floor(contentSize[width] / size[width]);

      if (loop) {
        pageCount = pageCount / 2;
      }

      if (pageCount === state.pageCount) {
        return null;
      }

      let nextState = { pageCount };
      const activeIndex = this._calculateActiveIndex({ pageCount });

      if (activeIndex !== state.activeIndex) {
        nextState.activeIndex = activeIndex;
      }

      return nextState;
    });
  }

  _setActiveIndex() {
    const player = this.playerRef.current;

    if (!player) {
      return;
    }

    this.setState(state => {
      const { pageCount } = state;
      const activeIndex = this._calculateActiveIndex({ pageCount });

      if (activeIndex === state.activeIndex) {
        return null;
      }

      return { activeIndex };
    });
  }

  _calculateActiveIndex({ pageCount }) {
    const { direction } = this.props;
    const player = this.playerRef.current;
    const pad = player.padRef.current;
    const size = pad.getSize();
    const contentOffset = pad.getContentOffset();

    const [width, x] = direction === 'x' ? ['width', 'x'] : ['height', 'y'];

    let activeIndex = Math.max(Math.round(-contentOffset[x] / size[width]), 0);

    if (activeIndex >= pageCount) {
      activeIndex -= pageCount;
    }

    return activeIndex;
  }

  render() {
    const {
      showsIndicator,
      renderIndicator,
      onSlideChange,
      ...playerProps
    } = this.props;
    const { pageCount, activeIndex } = this.state;
    playerProps.onContentResize = this._onPlayerContentResize;

    let element = playerProps.children;
    if (typeof element === 'function') {
      element = element(this);
    }
    playerProps.children = element;
    playerProps.onScroll = this._onPlayerScroll;

    const wrapperStyle = {
      position: 'relative',
    };

    return (
      <div style={wrapperStyle}>
        <Player {...playerProps} ref={this.playerRef} />
        {renderIndicator && renderIndicator({ pageCount, activeIndex })}
      </div>
    );
  }
}
