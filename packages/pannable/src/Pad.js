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
  getAdjustedContentOffset,
  getAdjustedPagingOffset,
  getAdjustedPagingVelocity,
  getDecelerationEndPosition,
  calculateDeceleration,
} from './utils/motion';

const POSITION_ZERO = { x: 0, y: 0 };
const VELOCITY_ZERO = { x: 0, y: 0 };

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
      contentOffset: POSITION_ZERO,
      contentVelocity: VELOCITY_ZERO,
      prevContentOffset: null,
      dragging: false,
      decelerating: false,
      dragStartPosition: null,
      decelerationEndPosition: null,
      decelerationRate: 0,
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
      dragging,
      decelerating,
      decelerationEndPosition,
    } = state;
    const nextState = {};

    if (prevContentOffset !== contentOffset) {
      let nextContentOffset = getAdjustedContentOffset(
        contentOffset,
        size,
        contentSize
      );
      let nextContentVelocity = contentVelocity;
      let nextDecelerating = decelerating;
      let nextDecelerationEndPosition = decelerationEndPosition;

      if (
        nextContentOffset.x !== contentOffset.x ||
        nextContentOffset.y !== contentOffset.y
      ) {
        nextContentVelocity = {
          x:
            nextContentOffset.x !== contentOffset.x ? 0 : nextContentVelocity.x,
          y:
            nextContentOffset.y !== contentOffset.y ? 0 : nextContentVelocity.y,
        };
        if (nextDecelerationEndPosition) {
          nextDecelerationEndPosition = {
            x:
              nextContentOffset.x !== contentOffset.x
                ? nextContentOffset.x
                : nextDecelerationEndPosition.x,
            y:
              nextContentOffset.y !== contentOffset.y
                ? nextContentOffset.y
                : nextDecelerationEndPosition.y,
          };
        }
      }

      if (nextDecelerationEndPosition) {
        if (
          nextContentOffset.x === nextDecelerationEndPosition.x &&
          nextContentOffset.y === nextDecelerationEndPosition.y &&
          nextContentVelocity.x === 0 &&
          nextContentVelocity.y === 0
        ) {
          nextDecelerating = false;
          nextDecelerationEndPosition = null;

          nextState.decelerationRate = 0;
        }
      }

      nextState.prevContentOffset = contentOffset;
      nextState.contentOffset = nextContentOffset;

      if (nextContentVelocity !== contentVelocity) {
        nextState.contentVelocity = nextContentVelocity;
      }
      if (nextDecelerating !== decelerating) {
        nextState.decelerating = nextDecelerating;
      }
      if (nextDecelerationEndPosition !== decelerationEndPosition) {
        nextState.decelerationEndPosition = nextDecelerationEndPosition;
      }

      if (props.onScroll) {
        props.onScroll({
          contentOffset: nextContentOffset,
          contentVelocity: nextContentVelocity,
          decelerating: nextDecelerating,
          dragging,
          size,
          contentSize,
        });
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
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, contentWidth, contentHeight } = this.props;

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
    if (prevState.contentOffset !== this.state.contentOffset) {
      if (this.state.decelerationEndPosition) {
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

  scrollTo({ position, animated }) {
    this.setState(({ contentOffset, size, dragging }, { pagingEnabled }) => {
      if (dragging) {
        return null;
      }

      if (!animated) {
        return {
          contentOffset: position,
          contentVelocity: VELOCITY_ZERO,
          decelerating: false,
          decelerationEndPosition: null,
          decelerationRate: 0,
        };
      }

      if (pagingEnabled) {
        position = getAdjustedPagingOffset(position, size);
      }

      return {
        contentOffset: { ...contentOffset },
        decelerating: true,
        decelerationEndPosition: position,
        decelerationRate: 0.01,
      };
    });
  }

  _decelerate(interval) {
    this.setState(
      ({
        contentVelocity,
        contentOffset,
        decelerationEndPosition,
        decelerationRate,
      }) => {
        if (!decelerationEndPosition) {
          return null;
        }

        const next = calculateDeceleration(
          interval,
          decelerationRate,
          contentOffset,
          contentVelocity,
          decelerationEndPosition
        );

        return { contentOffset: next.offset, contentVelocity: next.velocity };
      }
    );
  }

  _onDragStart = ({ translation, velocity }) => {
    this.setState(({ contentOffset }) => {
      const dragStartPosition = {
        x: contentOffset.x + translation.x,
        y: contentOffset.y + translation.y,
      };

      return {
        contentOffset: dragStartPosition,
        contentVelocity: velocity,
        dragging: true,
        dragStartPosition,
        decelerating: false,
        decelerationEndPosition: null,
        decelerationRate: 0,
      };
    });
  };

  _onDragMove = ({ translation, velocity }) => {
    this.setState(({ dragStartPosition }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };

      return { contentOffset, contentVelocity: velocity };
    });
  };

  _onDragEnd = ({ translation, velocity }) => {
    this.setState(({ dragStartPosition, size }, { pagingEnabled }) => {
      const contentOffset = {
        x: dragStartPosition.x + translation.x,
        y: dragStartPosition.y + translation.y,
      };
      let contentVelocity = velocity;
      let decelerationRate = pagingEnabled ? 0.02 : 0.002;

      if (pagingEnabled) {
        contentVelocity = getAdjustedPagingVelocity(
          contentVelocity,
          size,
          decelerationRate
        );
      }

      let decelerationEndPosition = getDecelerationEndPosition(
        contentOffset,
        contentVelocity,
        decelerationRate
      );

      if (pagingEnabled) {
        decelerationEndPosition = getAdjustedPagingOffset(
          decelerationEndPosition,
          size
        );
      }

      return {
        contentOffset,
        contentVelocity,
        dragging: false,
        decelerationEndPosition,
        decelerating: true,
        decelerationRate,
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
