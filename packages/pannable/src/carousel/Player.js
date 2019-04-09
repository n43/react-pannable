import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';

export default class Player extends React.Component {
  static defaultProps = {
    ...Pad.defaultProps,
    direction: 'x',
    autoplayEnabled: true,
    autoplayInterval: 3000,
    loop: true,
    scrollsBackOnEdge: true,
    onFrameChange: () => {},
    pagingEnabled: true,
  };

  constructor(props) {
    super(props);

    this.state = { mouseEntered: false, featuresDisabled: true };
    this.padRef = React.createRef();
  }

  componentDidMount() {
    this._tryStartPlaying();
  }

  componentDidUpdate(prevProps, prevState) {
    const { autoplayEnabled, autoplayInterval } = this.props;
    const { mouseEntered, featuresDisabled } = this.state;

    if (
      autoplayEnabled !== prevProps.autoplayEnabled ||
      autoplayInterval !== prevProps.autoplayInterval
    ) {
      this._stopPlaying();
      this._tryStartPlaying();
    }
    if (mouseEntered !== prevState.mouseEntered) {
      if (mouseEntered) {
        this._stopPlaying();
      } else {
        this._tryStartPlaying();
      }
    }
    if (featuresDisabled !== prevState.featuresDisabled) {
      if (featuresDisabled) {
        this._stopPlaying();
      } else {
        this._tryStartPlaying();
      }
    }
  }

  componentWillUnmount() {
    this._stopPlaying();
  }

  go(delta) {
    const { direction, scrollsBackOnEdge } = this.props;
    const pad = this.padRef.current;

    pad.scrollTo({
      offset: (state, props) => {
        const { contentOffset, size, contentSize } = state;
        const { pagingEnabled } = props;

        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        const sizeWidth = size[width];
        let minOffsetX = Math.min(sizeWidth - contentSize[width], 0);
        let offsetX = contentOffset[x] - delta * sizeWidth;

        if (pagingEnabled && sizeWidth > 0) {
          minOffsetX = size[width] * Math.ceil(minOffsetX / size[width]);
        }

        if (offsetX > 0) {
          offsetX = scrollsBackOnEdge ? minOffsetX : 0;
        } else if (offsetX < minOffsetX) {
          offsetX = scrollsBackOnEdge ? 0 : minOffsetX;
        }

        return { [x]: offsetX, [y]: contentOffset[y] };
      },
      animated: true,
    });
  }

  rewind() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }

  _tryStartPlaying() {
    if (!this.props.autoplayEnabled) {
      return;
    }

    if (this.state.featuresDisabled) {
      return;
    }

    if (this.state.mouseEntered) {
      return;
    }

    const pad = this.padRef.current;

    if (!pad || pad.isDragging() || pad.isDecelerating()) {
      return;
    }

    this._startPlaying();
  }

  _startPlaying() {
    const { autoplayInterval } = this.props;

    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this._autoplayTimer = undefined;
      this.forward();
    }, autoplayInterval);
  }

  _stopPlaying() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
    }
  }

  _onPadDragStart = () => {
    this._stopPlaying();
  };

  _onPadDragEnd = () => {
    this._tryStartPlaying();
  };

  _onPadDecelerationStart = () => {
    this._stopPlaying();
  };

  _onPadDecelerationEnd = () => {
    this._tryStartPlaying();
  };

  _onPadScroll = evt => {
    const { loop, onScroll } = this.props;
    const { featuresDisabled } = this.state;

    if (loop && !featuresDisabled) {
      this._alternateFramesForLoop(evt);
    }

    onScroll(evt);
  };

  _alternateFramesForLoop() {
    const { direction } = this.props;
    const pad = this.padRef.current;

    pad.scrollTo({
      offset: state => {
        const { contentOffset, contentSize } = state;
        const [width, x, y] =
          direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

        const offsetRange = 0.5 * contentSize[width];
        const minOffsetX = -contentSize[width] * 0.75;
        const maxOffsetX = minOffsetX + offsetRange;
        let offsetX = contentOffset[x];

        if (offsetX <= minOffsetX) {
          offsetX += offsetRange;
        } else if (maxOffsetX < offsetX) {
          offsetX -= offsetRange;
        }

        if (offsetX === contentOffset[x]) {
          return null;
        }

        return { [x]: offsetX, [y]: contentOffset[y] };
      },
      animated: false,
    });
  }

  _onPadResize = size => {
    this._checkSizeForLoop({ size });

    this.props.onResize(size);
  };

  _onPadContentResize = contentSize => {
    this._checkSizeForLoop({ contentSize });

    this.props.onContentResize(contentSize);
  };

  _checkSizeForLoop({ size, contentSize }) {
    const pad = this.padRef.current;
    console.log(size, contentSize, pad);
    if (!pad) {
      return;
    }

    if (!size) {
      size = pad.getSize();
    }

    if (!contentSize) {
      contentSize = pad.getContentSize();
    }

    this.setState((state, props) => {
      const width = props.direction === 'y' ? 'height' : 'width';
      let featuresDisabled = true;

      if (contentSize[width] >= size[width] * 2) {
        featuresDisabled = false;
      }

      if (featuresDisabled === state.featuresDisabled) {
        return null;
      }

      return { featuresDisabled };
    });
  }

  _onMouseEnter = () => {
    this.setState({ mouseEntered: true });
  };

  _onMouseLeave = () => {
    this.setState({ mouseEntered: false });
  };

  render() {
    const {
      direction,
      autoplayEnabled,
      autoplayInterval,
      loop,
      scrollsBackOnEdge,
      onFrameChange,
      ...padProps
    } = this.props;
    const { featuresDisabled } = this.state;

    if (direction === 'x') {
      padProps.alwaysBounceY = false;
    } else {
      padProps.alwaysBounceX = false;
    }

    padProps.onScroll = this._onPadScroll;
    padProps.onDragStart = this._onPadDragStart;
    padProps.onDragEnd = this._onPadDragEnd;
    padProps.onDecelerationStart = this._onPadDecelerationStart;
    padProps.onDecelerationEnd = this._onPadDecelerationEnd;
    padProps.onMouseEnter = this._onMouseEnter;
    padProps.onMouseLeave = this._onMouseLeave;
    padProps.onResize = this._onPadResize;
    padProps.onContentResize = this._onPadContentResize;

    let element = padProps.children;
    if (typeof element === 'function') {
      element = element(this);
    }

    if (loop && !featuresDisabled) {
      const itemElement = element;
      element = (
        <ListContent
          direction={direction}
          itemCount={2}
          renderItem={({ Item }) => <Item forceRender>{itemElement}</Item>}
        />
      );
    }

    padProps.children = element;

    return <Pad {...padProps} ref={this.padRef} />;
  }
}
