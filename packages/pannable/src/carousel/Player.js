import React, { useCallback, useMemo, useReducer, useEffect } from 'react';
import Pad from '../pad/Pad';
import ListContent from '../pad/ListContent';
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

function Player(props) {
  const {
    direction,
    loop,
    autoplayEnabled,
    autoplayInterval,
    children,
    ...padProps
  } = props;
  const { scrollTo: padScrollTo, onMouseEnter, onMouseLeave } = padProps;
  const [state, dispatch] = useReducer(reducer, initialState);

  const { mouseEntered, loopCount, loopOffset, scrollTo, pad } = state;

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

  useEffect(() => {
    if (!autoplayEnabled || mouseEntered || pad.drag || pad.deceleration) {
      return;
    }

    const autoplayTimer = setTimeout(() => {
      dispatch({ type: 'playNext' });
    }, autoplayInterval);

    return () => {
      clearTimeout(autoplayTimer);
    };
  }, [
    autoplayEnabled,
    autoplayInterval,
    mouseEntered,
    pad.drag,
    pad.deceleration,
  ]);

  useMemo(() => {
    dispatch({ type: 'setOptions', value: [direction, loop] });
  }, [loop, direction]);

  useMemo(() => {
    dispatch({ type: 'setScrollTo', value: padScrollTo });
  }, [padScrollTo]);

  padProps.scrollTo = scrollTo;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (autoplayEnabled) {
    padProps.onMouseEnter = onPadMouseEnter;
    padProps.onMouseLeave = onPadMouseLeave;
  }

  return (
    <Pad {...padProps}>
      {nextPad => {
        if (pad !== nextPad) {
          dispatch({ type: 'setPad', value: nextPad });
        }

        const element =
          typeof children === 'function' ? children(state) : children;

        return (
          <ListContent
            direction={direction}
            itemCount={loopCount}
            renderItem={({ Item, itemIndex }) => (
              <Item key={itemIndex + loopOffset} hash="Player_loop">
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
