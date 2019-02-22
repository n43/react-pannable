import React from 'react';
import Pannable from './Pannable';
import { getElementSize, getElementScrollSize } from './utils/sizeGetter';
import createDetectElementResize from './utils/detectElementResize';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import {
  needsScrollDeceleration,
  calculateScrollDeceleration,
  needsPagingDeceleration,
  calculatePagingDeceleration,
} from './utils/deceleration';

function getAdjustedContentOffset(offset, size, cSize) {
  return {
    x: Math.max(Math.min(size.width - cSize.width, 0), Math.min(offset.x, 0)),
    y: Math.max(Math.min(size.height - cSize.height, 0), Math.min(offset.y, 0)),
  };
}

export default class Pad extends React.Component {
  static defaultProps = {
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    contentStyle: null,
    pagingEnabled: false,
    autoAdjustsContentSize: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      size: { width: props.width, height: props.height },
      contentSize: { width: props.contentWidth, height: props.contentHeight },
      contentOffset: { x: 0, y: 0 },
      contentVelocity: { x: 0, y: 0 },
      prevContentOffset: null,
      dragging: false,
      decelerating: false,
      dragStartPosition: null,
    };

    this.wrapperRef = React.createRef();
    this.contentRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const {
      size,
      contentSize,
      contentOffset,
      contentVelocity,
      prevContentOffset,
    } = state;
    const nextState = {};

    if (prevContentOffset !== contentOffset) {
      let nextContentOffset = getAdjustedContentOffset(
        contentOffset,
        size,
        contentSize
      );
      let nextContentVelocity;

      if (
        nextContentOffset.x !== contentOffset.x ||
        nextContentOffset.y !== contentOffset.y
      ) {
        nextContentVelocity = {
          x: nextContentOffset.x !== contentOffset.x ? 0 : contentVelocity.x,
          y: nextContentOffset.y !== contentOffset.y ? 0 : contentVelocity.y,
        };
      }

      nextState.prevContentOffset = contentOffset;
      nextState.contentOffset = nextContentOffset;

      if (nextContentVelocity) {
        nextState.contentVelocity = nextContentVelocity;
      }
    }

    return nextState;
  }

  componentDidMount() {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      autoAdjustsContentSize,
    } = this.props;
    const parentNode = this.wrapperRef.current.parentNode;
    const contentNode = this.contentRef.current;
    let initedSize = {};
    let initedContentSize = {};

    const computeSize = (width, height) => {
      let computedSize = { width, height };
      const parentSize = getElementSize(parentNode);

      if (width === 0) {
        computedSize.width = parentSize.width;
      }
      if (height === 0) {
        computedSize.height = parentSize.height;
      }
      return computedSize;
    };

    const computeContentSize = (contentWidth, contentHeight) => {
      let computedSize = { width: contentWidth, height: contentHeight };
      const contentSize = getElementScrollSize(contentNode);
      if (contentWidth === 0) {
        computedSize.width = contentSize.width;
      }
      if (contentHeight === 0) {
        computedSize.height = contentSize.height;
      }
      return computedSize;
    };

    if (width === 0 || height === 0) {
      this._detectWrapperResize = createDetectElementResize();
      this._detectWrapperResize.addResizeListener(parentNode, () => {
        const size = computeSize(width, height);
        this.setState({ size });
      });
      initedSize = computeSize(width, height);
    }

    if (autoAdjustsContentSize && (contentWidth === 0 || contentHeight === 0)) {
      this._detectContentResize = createDetectElementResize();
      this._detectContentResize.addResizeListener(contentNode, () => {
        const contentSize = computeContentSize(contentWidth, contentHeight);
        this.setState({ contentSize });
      });
      initedContentSize = computeContentSize(contentWidth, contentHeight);
    }

    this.setState(({ size, contentSize }) => {
      return {
        size: { ...size, ...initedSize },
        contentSize: { ...contentSize, initedContentSize },
      };
    });

    this._configureDeceleration();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      width,
      height,
      contentWidth,
      contentHeight,
      onResize,
      onContentResize,
      onScroll,
    } = this.props;
    const {
      size,
      contentSize,
      contentOffset,
      contentVelocity,
      dragging,
      decelerating,
    } = this.state;

    if (prevProps.pagingEnabled !== this.props.pagingEnabled) {
      this._configureDeceleration();
    }
    if (prevProps.width !== width || prevProps.height !== height) {
      this.setState(({ contentOffset }) => ({
        size: { width, height },
        contentOffset: { ...contentOffset },
      }));
    }
    if (
      prevProps.contentWidth !== contentWidth ||
      prevProps.contentHeight !== contentHeight
    ) {
      this.setState(({ contentOffset }) => ({
        contentSize: { width: contentWidth, height: contentHeight },
        contentOffset: { ...contentOffset },
      }));
    }
    if (prevState.size !== size) {
      if (onResize) {
        onResize({ size, contentSize, contentOffset, dragging, decelerating });
      }
    }
    if (prevState.contentSize !== contentSize) {
      if (onContentResize) {
        onContentResize({
          size,
          contentSize,
          contentOffset,
          dragging,
          decelerating,
        });
      }
    }
    if (prevState.contentOffset !== contentOffset) {
      if (onScroll) {
        onScroll({ size, contentSize, contentOffset, dragging, decelerating });
      }
    }
    if (prevState.contentVelocity !== contentVelocity) {
      if (decelerating) {
        const startTime = new Date().getTime();

        if (this._deceleratingTimer) {
          cancelAnimationFrame(this._deceleratingTimer);
        }

        this._deceleratingTimer = requestAnimationFrame(() => {
          this._deceleratingTimer = undefined;
          this._decelerate(new Date().getTime() - startTime);
        });
      }
    }
  }

  componentWillUnmount() {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
      this._deceleratingTimer = undefined;
    }
  }

  getSize() {
    return this.state.size;
  }

  getContentSize() {
    return this.state.contentSize;
  }

  getContentOffset() {
    return this.state.contentOffset;
  }

  isDragging() {
    return this.state.dragging;
  }

  isDecelerating() {
    return this.state.decelerating;
  }

  _configureDeceleration() {
    if (this.props.pagingEnabled) {
      this._needsDecelerate = needsPagingDeceleration;
      this._calculateDeceleration = calculatePagingDeceleration;
    } else {
      this._needsDecelerate = needsScrollDeceleration;
      this._calculateDeceleration = calculateScrollDeceleration;
    }
  }

  _decelerate(interval) {
    this.setState(({ size, contentSize, contentVelocity, contentOffset }) => {
      const nextX = this._calculateDeceleration(
        interval,
        contentOffset.x,
        contentVelocity.x,
        size.width,
        contentSize.width
      );
      const nextY = this._calculateDeceleration(
        interval,
        contentOffset.y,
        contentVelocity.y,
        size.height,
        contentSize.height
      );
      const nextContentOffset = { x: nextX.offset, y: nextY.offset };
      const nextVelocity = { x: nextX.velocity, y: nextY.velocity };

      return {
        contentOffset: nextContentOffset,
        contentVelocity: nextVelocity,
        decelerating: this._needsDecelerate(
          nextContentOffset,
          nextVelocity,
          size
        ),
      };
    });
  }

  _onDragStart = ({ translation, velocity }) => {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
      this._deceleratingTimer = undefined;
    }

    this.setState(({ contentOffset }) => {
      const dragStartPosition = {
        x: contentOffset.x + translation.x,
        y: contentOffset.y + translation.y,
      };

      return {
        dragging: true,
        decelerating: false,
        contentOffset: dragStartPosition,
        contentVelocity: velocity,
        dragStartPosition,
      };
    });
  };

  _onDragMove = ({ translation }) => {
    this.setState(({ dragStartPosition }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };

      return { contentOffset };
    });
  };

  _onDragEnd = ({ translation, velocity }) => {
    this.setState(({ size, dragStartPosition }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };

      return {
        dragging: false,
        decelerating: this._needsDecelerate(contentOffset, velocity, size),
        contentOffset,
        contentVelocity: velocity,
        dragStartPosition: null,
      };
    });
  };

  render() {
    const { style, contentStyle, children } = this.props;
    const { size, contentSize, contentOffset } = this.state;
    const wrapperStyles = StyleSheet.create({
      overflow: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      width: size.width,
      height: size.height,
      ...style,
    });
    const contentStyles = StyleSheet.create({
      position: 'relative',
      boxSizing: 'border-box',
      width: contentSize.width,
      height: contentSize.height,
      transform: `translate3d(${contentOffset.x}px, ${contentOffset.y}px, 0)`,
      overflow:
        contentSize.width === 0 || contentSize.height === 0
          ? 'scroll'
          : 'hidden',
      ...contentStyle,
    });
    return (
      <div ref={this.wrapperRef}>
        <Pannable
          style={wrapperStyles}
          onStart={this._onDragStart}
          onMove={this._onDragMove}
          onEnd={this._onDragEnd}
        >
          <div style={contentStyles} ref={this.contentRef}>
            {children}
          </div>
        </Pannable>
      </div>
    );
  }
}
