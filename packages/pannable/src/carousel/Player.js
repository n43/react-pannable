import React, { useReducer } from 'react';
import Pad from '../Pad';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import ListContent from '../ListContent';

const defaultPlayerProps = {
  ...Pad.defaultProps,
  direction: 'x',
  autoplayEnabled: true,
  autoplayInterval: 5000,
  loop: true,
  pagingEnabled: true,
  directionalLockEnabled: true,
};

function Player({
  direction = defaultPlayerProps.direction,
  autoplayEnabled = defaultPlayerProps.autoplayEnabled,
  autoplayInterval = defaultPlayerProps.autoplayInterval,
  loop = defaultPlayerProps.loop,
  pagingEnabled = defaultPlayerProps.pagingEnabled,
  directionalLockEnabled = defaultPlayerProps.directionalLockEnabled,
  ...padProps
}) {
  const {
    onDragStart = defaultPlayerProps.onDragStart,
    onDragEnd = defaultPlayerProps.onDragEnd,
    onDecelerationStart = defaultPlayerProps.onDecelerationStart,
    onDecelerationEnd = defaultPlayerProps.onDecelerationEnd,
    onMouseEnter = defaultPlayerProps.onMouseEnter,
    onMouseLeave = defaultPlayerProps.onMouseLeave,
    onScroll = defaultPlayerProps.onScroll,
    onContentResize = defaultPlayerProps.onContentResize,
  } = padProps;

  // const startPlaying = useCallback(evt => {
  //   const pad = this.padRef.current;

  //   if (!pad || pad.isDragging() || pad.isDecelerating()) {
  //     return;
  //   }
  //   if (this.state.mouseEntered) {
  //     return;
  //   }

  //   const { autoplayInterval } = this.props;

  //   if (this._autoplayTimer) {
  //     clearTimeout(this._autoplayTimer);
  //   }

  //   this._autoplayTimer = setTimeout(() => {
  //     this._autoplayTimer = undefined;
  //     this.forward();
  //   }, autoplayInterval);
  // }, []);

  // useIsomorphicLayoutEffect(() => {
  //   if (autoplayEnabled) {
  //   }
  // }, [autoplayEnabled, autoplayInterval]);

  // const

  let element = padProps.children;

  if (typeof element === 'function') {
    element = element(state);
  }

  return (
    <Pad {...padProps}>
      <ListContent
        direction={direction}
        itemCount={2}
        renderItem={({ Item, itemIndex }) => (
          <Item key={itemIndex + 2} hash="loop">
            {element}
          </Item>
        )}
      />
    </Pad>
  );
}

Player.defaultProps = defaultPlayerProps;
export default Player;
