import React, { Fragment, useCallback } from 'react';
import clsx from 'clsx';
import './vi.css';

export default function VerticalIndicator(props) {
  const { activeIndex, list, width, height, onGoto } = props;
  const itemCount = list.length;

  const onThumbClick = useCallback(
    evt => {
      const node = evt.currentTarget;
      const index = Number(node.dataset.index);

      if (onGoto) {
        onGoto(index);
      }
    },
    [onGoto]
  );

  if (itemCount < 2) {
    return null;
  }

  const thumbs = [];

  const barWidth = Math.floor(width / itemCount);
  const thumbWidth = Math.floor(0.9 * barWidth);
  const thumbHeight = Math.round(thumbWidth * (height / width));

  for (let idx = 0; idx < itemCount; idx++) {
    thumbs.push(
      <div
        key={idx}
        data-index={idx}
        style={{
          width: thumbWidth,
          height: thumbHeight,
          background: `url(${list[idx].url}) no-repeat 0 0 / ${thumbWidth}px ${thumbHeight}px`,
        }}
        className={clsx('vi-thumb', { 'vi-thumb-active': activeIndex === idx })}
        onClick={onThumbClick}
      >
        <div className="vi-thumb-mask" />
      </div>
    );
  }

  return (
    <div style={{ width: barWidth }} className="vi-bar">
      {thumbs}
    </div>
  );
}
