import React, { useCallback, useMemo, useReducer, useEffect } from 'react';
import Pad from '../pad/Pad';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import ListContent from '../pad/ListContent';
import { reducer, initialState } from './playerReducer';

const defaultPlayerProps = {
  direction: 'x',
  loop: true,
  autoplayEnabled: true,
  autoplayInterval: 5000,
  onStateChange: () => {},
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
    onStateChange,
    children,
    ...padProps
  } = props;
  const { scrollTo: padScrollTo, onMouseEnter, onMouseLeave } = padProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;

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

  const onPadStateChange = useCallback(value => {
    dispatch({ type: 'setPad', value });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevState !== state) {
      onStateChange(state);
    }
  });

  useEffect(() => {
    if (
      !autoplayEnabled ||
      state.mouseEntered ||
      state.pad.drag ||
      state.pad.deceleration
    ) {
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
    state.mouseEntered,
    state.pad.drag,
    state.pad.deceleration,
  ]);

  useMemo(() => {
    dispatch({ type: 'setOptions', value: [direction, loop] });
  }, [loop, direction]);

  useMemo(() => {
    dispatch({ type: 'setScrollTo', value: padScrollTo });
  }, [padScrollTo]);

  padProps.scrollTo = state.scrollTo;
  padProps.onStateChange = onPadStateChange;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (autoplayEnabled) {
    padProps.onMouseEnter = onPadMouseEnter;
    padProps.onMouseLeave = onPadMouseLeave;
  }

  const element = typeof children === 'function' ? children(state) : children;

  return (
    <Pad {...padProps}>
      <ListContent
        direction={direction}
        itemCount={state.loopCount}
        renderItem={({ Item, itemIndex }) => (
          <Item key={itemIndex + state.loopOffset} hash="Player_loop">
            {element}
          </Item>
        )}
      />
    </Pad>
  );
}

Player.defaultProps = defaultPlayerProps;
export default Player;
