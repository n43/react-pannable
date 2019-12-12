import React, { Fragment, useCallback } from 'react';
import clsx from 'clsx';
import SvgPrev from './SvgPrev';
import SvgNext from './SvgNext';
import './hi.css';

export default function HorizontalIndicator(props) {
  const { activeIndex, itemCount, onPrev, onNext, onGoto } = props;
  const dots = [];

  const onDotClick = useCallback(
    evt => {
      const node = evt.currentTarget;
      const index = Number(node.dataset.index);

      if (onGoto) {
        onGoto(index);
      }
    },
    [onGoto]
  );

  for (let idx = 0; idx < itemCount; idx++) {
    dots.push(
      <div
        key={idx}
        data-index={idx}
        className={clsx('hi-dot', { 'hi-dot-active': activeIndex === idx })}
        onClick={onDotClick}
      />
    );
  }

  return (
    <Fragment>
      <div className="hi-bar">{dots}</div>
      <SvgPrev className="hi-prev" onClick={onPrev} />
      <SvgNext className="hi-next" onClick={onNext} />
    </Fragment>
  );
}
