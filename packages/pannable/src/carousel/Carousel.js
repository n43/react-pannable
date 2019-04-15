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
      realIndex: 0,
    };
    this.playerRef = React.createRef();
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    const { onSlideChange } = this.props;
    const { activeIndex, pageCount } = this.state;

    if (prevState.activeIndex !== activeIndex) {
      onSlideChange(activeIndex);
    }
    if (prevState.pageCount !== pageCount) {
      const player = this.playerRef.current;
      if (player) {
        const pad = player.padRef.current;
        const size = pad.getSize();
        const contentOffset = pad.getContentOffset();
        this._calculateActiveIndex({ size, contentOffset });
      }
    }
  }

  getActiveIndex() {
    return this.activeIndex;
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
    this._calculateActiveIndex(evt);

    this.props.onScroll(evt);
  };

  _onPlayerContentResize = contentSize => {
    this._calculatePageCount({ contentSize });

    this.props.onContentResize(contentSize);
  };

  _calculateActiveSlideForLoop({ activeIndex, pageCount }) {
    if (activeIndex < pageCount / 2) {
      return activeIndex;
    }

    return activeIndex - pageCount / 2;
  }

  _calculatePageCount({ size = null, contentSize = null }) {
    const player = this.playerRef.current;

    if (!player) {
      return;
    }

    const pad = player.padRef.current;
    if (!size) {
      size = pad.getSize();
    }
    if (!contentSize) {
      contentSize = pad.getContentSize();
    }

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

      return { pageCount };
    });
  }

  _calculateActiveIndex({ size, contentOffset }) {
    this.setState((state, props) => {
      const { direction } = props;
      const { pageCount } = state;
      const [width, x] = direction === 'x' ? ['width', 'x'] : ['height', 'y'];
      let activeIndex = Math.abs(Math.round(contentOffset[x] / size[width]));

      if (activeIndex >= pageCount) {
        activeIndex -= pageCount;
      }

      if (activeIndex === state.activeIndex) {
        return null;
      }

      return { activeIndex };
    });
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
    const playerElem = (
      <Player
        {...playerProps}
        onScroll={this._onPlayerScroll}
        ref={this.playerRef}
      />
    );

    if (!renderIndicator) {
      return playerElem;
    }

    const wrapperStyle = {
      position: 'relative',
    };

    return (
      <div style={wrapperStyle}>
        {playerElem}
        {renderIndicator({ pageCount, activeIndex })}
      </div>
    );
  }
}
