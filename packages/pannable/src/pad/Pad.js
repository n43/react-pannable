import React, { useMemo, useCallback, useState } from 'react';
import Pannable from '../Pannable';
import PadInner from './PadInner';
import PadContext from './PadContext';
import GeneralContent from './GeneralContent';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { isEqualToSize } from '../utils/geometry';
import StyleSheet from '../utils/StyleSheet';

const defaultPadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  onScroll: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onDecelerationStart: () => {},
  onDecelerationEnd: () => {},
  onContentResize: () => {},
  renderBackground: () => null,
  renderOverlay: () => null,
  scrollTo: null,
  scrollToRect: null,
  ...Pannable.defaultProps,
};

function Pad(props) {
  const {
    width,
    height,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounceX,
    alwaysBounceY,
    onScroll,
    onDragStart,
    onDragEnd,
    onDecelerationStart,
    onDecelerationEnd,
    onContentResize,
    renderBackground,
    renderOverlay,
    scrollTo,
    scrollToRect,
    children,
    ...pannableProps
  } = props;
  const { enabled, shouldStart } = pannableProps;
  const size = useMemo(() => ({ width, height }), [width, height]);
  const alwaysBounce = useMemo(
    () => ({
      x: alwaysBounceX,
      y: alwaysBounceY,
    }),
    [alwaysBounceX, alwaysBounceY]
  );
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const prevContentSizeRef = usePrevRef(contentSize);
  const prevContentSize = prevContentSizeRef.current;

  const shouldPannableStart = useCallback(
    evt => {
      if (!shouldDragStart(evt.velocity, size, contentSize)) {
        return false;
      }

      return shouldStart(evt);
    },
    [shouldStart, size, contentSize]
  );

  const onResize = useCallback(contentSize => {
    setContentSize(prevContentSize =>
      isEqualToSize(prevContentSize, contentSize)
        ? prevContentSize
        : contentSize
    );
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevContentSize !== contentSize) {
      onContentResize(contentSize);
    }
  });

  pannableProps.shouldStart = shouldPannableStart;

  const elemStyle = {
    overflow: 'hidden',
    position: 'relative',
    width: size.width,
    height: size.height,
  };

  if (pannableProps.style) {
    Object.assign(elemStyle, pannableProps.style);
  }

  pannableProps.style = elemStyle;

  return (
    <Pannable {...pannableProps}>
      {pannable => {
        const padProps = {
          enabled,
          pannable,
          contentSize,
          size,
          pagingEnabled,
          directionalLockEnabled,
          alwaysBounce,
          onScroll,
          onDragStart,
          onDragEnd,
          onDecelerationStart,
          onDecelerationEnd,
          scrollTo,
          scrollToRect,
        };

        return (
          <PadInner {...padProps}>
            {pad => {
              const visibleRect = {
                x: -pad.contentOffset.x,
                y: -pad.contentOffset.y,
                width: size.width,
                height: size.height,
              };

              const input = { ...pad, contentSize, pannable };

              let backgroundLayer = renderBackground(input);

              if (backgroundLayer !== null) {
                const layerStyle = {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                };

                backgroundLayer = (
                  <div style={layerStyle}>{backgroundLayer}</div>
                );
              }

              let overlayLayer = renderOverlay(input);

              if (overlayLayer !== null) {
                const layerStyle = {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                };

                overlayLayer = <div style={layerStyle}>{overlayLayer}</div>;
              }

              let contentLayer =
                typeof children === 'function' ? children(input) : children;

              if (
                !React.isValidElement(contentLayer) ||
                !contentLayer.type.PadContent
              ) {
                contentLayer = <GeneralContent>{contentLayer}</GeneralContent>;
              }

              const contentStyle = StyleSheet.create({
                position: 'absolute',
                width: contentSize.width,
                height: contentSize.height,
                transformTranslate: pad.contentOffset,
                willChange: 'transform',
              });

              if (contentLayer.props.style) {
                Object.assign(contentStyle, contentLayer.props.style);
              }

              contentLayer = React.cloneElement(contentLayer, {
                style: contentStyle,
                ref: contentLayer.ref,
              });

              return (
                <PadContext.Provider value={{ visibleRect, onResize }}>
                  {backgroundLayer}
                  {contentLayer}
                  {overlayLayer}
                </PadContext.Provider>
              );
            }}
          </PadInner>
        );
      }}
    </Pannable>
  );
}

Pad.defaultProps = defaultPadProps;

export default Pad;

function shouldDragStart(velocity, size, cSize) {
  const height =
    Math.abs(velocity.y) < Math.abs(velocity.x) ? 'width' : 'height';

  return size[height] < cSize[height];
}
