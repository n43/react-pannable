import React, { useCallback, useMemo, useReducer, useEffect } from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';
import { reducer, initialState } from './playerReducer';

const defaultPlayerProps = {
  direction: 'x',
  loop: true,
  autoplayEnabled: true,
  autoplayInterval: 5000,
  ...Pad.defaultProps,
  pagingEnabled: true,
  directionalLockEnabled: true,
};

function Player({
  direction,
  loop,
  autoplayEnabled,
  autoplayInterval,
  ...padProps
}) {
  const { onMouseEnter, onMouseLeave } = padProps;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { mouseEntered, loopCount, loopOffset, scrollTo } = state;
  const { drag, deceleration } = state.pad;

  useEffect(() => {
    if (!autoplayEnabled || drag || deceleration || mouseEntered) {
      return;
    }

    let autoplayTimer = setTimeout(() => {
      autoplayTimer = undefined;
      dispatch({ type: 'playNext' });
    }, autoplayInterval);

    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
    };
  }, [autoplayEnabled, mouseEntered, drag, deceleration, autoplayInterval]);

  useMemo(() => {
    if (padProps.scrollTo) {
      dispatch({ type: 'setScrollTo', value: padProps.scrollTo });
    }
  }, [padProps.scrollTo]);

  useMemo(() => {
    dispatch({ type: 'setOptions', value: [direction, loop] });
  }, [loop, direction]);

  const onPadMouseEnter = useCallback(
    evt => {
      dispatch({ type: 'setMouseEntered', value: true });

      if (onMouseEnter) {
        onMouseEnter(evt);
      }
    },
    [onMouseEnter]
  );

  const onPadMouseLeave = useCallback(
    evt => {
      dispatch({ type: 'setMouseEntered', value: false });

      if (onMouseLeave) {
        onMouseLeave(evt);
      }
    },
    [onMouseLeave]
  );

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (autoplayEnabled) {
    padProps.onMouseEnter = onPadMouseEnter;
    padProps.onMouseLeave = onPadMouseLeave;
  }

  padProps.scrollTo = scrollTo;

  return (
    <Pad {...padProps}>
      {pad => {
        if (pad !== state.pad) {
          dispatch({ type: 'setPad', value: pad });
        }

        let element = padProps.children;

        if (typeof element === 'function') {
          element = element(state);
        }

        return (
          <ListContent
            direction={direction}
            itemCount={loopCount}
            renderItem={({ Item, itemIndex }) => (
              <Item key={itemIndex + loopOffset} hash="loop">
                {element}
              </Item>
            )}
          />
        );
      }}
    </Pad>
  );
}

Player.defaultProps = defaultPlayerProps;
export default Player;
