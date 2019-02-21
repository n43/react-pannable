import React from 'react';
import Pannable from './Pannable';
import Sizer from './utils/Sizer';
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

  state = {
    size: { width: 0, height: 0 },
    contentSize: { width: 0, height: 0 },
    contentOffset: { x: 0, y: 0 },
    dragging: false,
    decelerating: false,
    draggingStartPosition: null,
    deceleratingVelocity: null,
  };

  wrapperRef = React.createRef();
  contentRef = React.createRef();

  static getDerivedStateFromProps(props, state) {
    const { width, height, contentWidth, contentHeight } = props;
    const { size, contentSize, contentOffset } = state;
    const nextState = {};
    let needsUpdateContentOffset = false;

    if (
      (width !== 0 && width !== size.width) ||
      (height !== 0 && height !== size.height)
    ) {
      needsUpdateContentOffset = true;

      nextState.size = {
        width: width === 0 ? size.width : width,
        height: height === 0 ? size.height : height,
      };
    }
    if (
      (contentWidth !== 0 && contentWidth !== contentSize.width) ||
      (contentHeight !== 0 && contentHeight !== contentSize.height)
    ) {
      needsUpdateContentOffset = true;

      nextState.contentSize = {
        width: contentWidth === 0 ? contentSize.width : contentWidth,
        height: contentHeight === 0 ? contentSize.height : contentHeight,
      };
    }

    if (needsUpdateContentOffset) {
      nextState.contentOffset = getAdjustedContentOffset(
        contentOffset,
        nextState.size || size,
        nextState.contentSize || contentSize
      );
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

    let computedSize = { width, height };
    let computedContentSize = { width: contentWidth, height: contentHeight };

    if (width === 0 || height === 0) {
      const parentNode = this.wrapperRef.current.parentNode;
      // Sizer.addResizeListener(parentNode);
      const parentSize = Sizer.getSize(parentNode);

      if (width === 0) {
        computedSize.width = parentSize.width;
      }
      if (height === 0) {
        computedSize.height = parentSize.height;
      }
    }

    if (autoAdjustsContentSize && (contentWidth === 0 || contentHeight === 0)) {
      const contentNode = this.contentRef.current;
      const contentSize = Sizer.getScrollSize(contentNode);

      if (contentWidth === 0) {
        computedContentSize.width = contentSize.width;
      }
      if (contentHeight === 0) {
        computedContentSize.height = contentSize.height;
      }
    }

    this.setState({
      size: computedSize,
      contentSize: computedContentSize,
    });

    this._configureDeceleration();
  }

  componentDidUpdate(prevProps, prevState) {
    const { onResize, onContentResize, onScroll } = this.props;
    const {
      size,
      contentSize,
      contentOffset,
      dragging,
      decelerating,
      deceleratingVelocity,
    } = this.state;

    if (prevProps.pagingEnabled !== this.props.pagingEnabled) {
      this._configureDeceleration();
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
    if (prevState.deceleratingVelocity !== deceleratingVelocity) {
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
    this.setState(
      ({ size, contentSize, deceleratingVelocity, contentOffset }) => {
        const nextX = this._calculateDeceleration(
          interval,
          contentOffset.x,
          deceleratingVelocity.x,
          size.width,
          contentSize.width
        );
        const nextY = this._calculateDeceleration(
          interval,
          contentOffset.y,
          deceleratingVelocity.y,
          size.height,
          contentSize.height
        );
        const nextContentOffset = { x: nextX.offset, y: nextY.offset };
        const nextVelocity = { x: nextX.velocity, y: nextY.velocity };

        return {
          contentOffset: nextContentOffset,
          deceleratingVelocity: nextVelocity,
          decelerating: this._needsDecelerate(
            nextContentOffset,
            nextVelocity,
            size
          ),
        };
      }
    );
  }

  _onDragStart = () => {
    if (this._deceleratingTimer) {
      cancelAnimationFrame(this._deceleratingTimer);
      this._deceleratingTimer = undefined;
    }

    this.setState(({ contentOffset }) => ({
      draggingStartPosition: contentOffset,
      dragging: true,
      deceleratingVelocity: null,
      decelerating: false,
    }));
  };

  _onDragMove = ({ translation }) => {
    this.setState(({ size, contentSize, draggingStartPosition }) => {
      const contentOffset = getAdjustedContentOffset(
        {
          x: draggingStartPosition.x + translation.x,
          y: draggingStartPosition.y + translation.y,
        },
        size,
        contentSize
      );

      return { contentOffset };
    });
  };

  _onDragEnd = ({ velocity, translation }) => {
    this.setState(({ size, contentSize, draggingStartPosition }) => {
      const contentOffset = getAdjustedContentOffset(
        {
          x: draggingStartPosition.x + translation.x,
          y: draggingStartPosition.y + translation.y,
        },
        size,
        contentSize
      );

      return {
        contentOffset,
        draggingStartPosition: null,
        dragging: false,
        deceleratingVelocity: velocity,
        decelerating: this._needsDecelerate(contentOffset, velocity, size),
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
