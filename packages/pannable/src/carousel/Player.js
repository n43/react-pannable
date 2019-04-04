import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';
import ItemContent from '../ItemContent';

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

    this.state = {
      mouseEntered: false,
    };
    this.padRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.autoplayEnabled) {
      this._start();
    }
  }

  componentWillUnmount() {
    this._stop();
  }

  scrollTo({ offset, animated = true }) {
    const { direction, scrollsBackOnEdge } = this.props;
    const pad = this.padRef.current;
    const size = pad.getSize();
    const contentSize = pad.getContentSize();

    const [width, height, x, y] =
      direction === 'x'
        ? ['width', 'height', 'x', 'y']
        : ['height', 'width', 'y', 'x'];

    if (offset[x] > 0 || offset[y] > 0) {
      return;
    }

    if (
      contentSize[width] - Math.abs(offset[x]) < size[width] ||
      contentSize[height] - Math.abs(offset[y]) < size[height]
    ) {
      if (!scrollsBackOnEdge) {
        return;
      }
      offset = { x: 0, y: 0 };
    }

    pad.scrollTo({ offset, animated });
  }

  rewind() {
    const { direction } = this.props;
    const pad = this.padRef.current;
    const size = pad.getSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    this.scrollTo({
      offset: { [x]: contentOffset[x] + size[width], [y]: contentOffset[y] },
    });
  }

  forward() {
    const { direction } = this.props;
    const pad = this.padRef.current;
    const size = pad.getSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    this.scrollTo({
      offset: { [x]: contentOffset[x] - size[width], [y]: contentOffset[y] },
    });
  }

  _start() {
    const { autoplayInterval } = this.props;

    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
    }

    this._autoplayTimer = setTimeout(() => {
      this._autoplayTimer = undefined;
      this.forward();
    }, autoplayInterval);
  }

  _stop() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = undefined;
    }
  }

  _onPadDragStart = () => {
    this._stop();
  };

  _onPadDragEnd = () => {
    const { autoplayEnabled } = this.props;
    const { mouseEntered } = this.state;
    const pad = this.padRef.current;
    const isDecelerating = pad.isDecelerating();

    if (autoplayEnabled && !isDecelerating && !mouseEntered) {
      this._start();
    }
  };

  _onPadDecelerationStart = () => {
    this._stop();
  };

  _onPadDecelerationEnd = () => {
    const { autoplayEnabled } = this.props;
    const { mouseEntered } = this.state;
    const pad = this.padRef.current;
    const isDragging = pad.isDragging();
    if (autoplayEnabled && !isDragging && !mouseEntered) {
      this._start();
    }
  };

  _onPadScroll = evt => {
    const { loop, onScroll } = this.props;

    if (loop) {
      this._alternateFramesForLoop();
    }
    onScroll(evt);
  };

  _alternateFramesForLoop() {
    const { direction } = this.props;
    const pad = this.padRef.current;
    const contentSize = pad.getContentSize();
    const contentOffset = pad.getContentOffset();
    const [width, x, y] =
      direction === 'x' ? ['width', 'x', 'y'] : ['height', 'y', 'x'];

    const offsetRange = 0.5 * contentSize[width];
    const minOffsetX = -contentSize[width] * 0.75;
    const maxOffsetX = minOffsetX + offsetRange;
    let offsetX = contentOffset[x];

    if (offsetX <= minOffsetX) {
      offsetX += offsetRange;
    } else if (maxOffsetX < offsetX) {
      offsetX -= offsetRange;
    }

    if (offsetX !== contentOffset[x]) {
      this.scrollTo({
        offset: { [x]: offsetX, [y]: contentOffset[y] },
        animated: false,
      });
    }
  }

  _onMouseEnter = () => {
    this.setState({ mouseEntered: true });
    this._stop();
  };

  _onMouseLeave = () => {
    const { autoplayEnabled } = this.props;
    const pad = this.padRef.current;
    const isDragging = pad.isDragging();
    const isDecelerating = pad.isDecelerating();

    this.setState({ mouseEntered: false });

    if (autoplayEnabled && !isDragging && !isDecelerating) {
      this._start();
    }
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

    let element = padProps.children;
    if (typeof element === 'function') {
      element = element(this);
    }

    if (loop) {
      const itemElement = <ItemContent hash="Item">{element}</ItemContent>;
      element = (
        <ListContent
          direction={direction}
          itemCount={2}
          renderItem={() => itemElement}
        />
      );
    }

    padProps.children = element;

    return <Pad {...padProps} ref={this.padRef} />;
  }
}
