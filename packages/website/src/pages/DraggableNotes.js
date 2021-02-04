import React, { useState, useCallback, useMemo, useRef } from 'react';
import { AutoResizing, Pannable } from 'react-pannable';
import clsx from 'clsx';
import './pan.css';
import SvgNote from './SvgNote';

const DraggableNotes = () => {
  const panEnabled = true;
  const cancelsOut = false;

  const [enabled, setEnabled] = useState(true);
  const [drag, setDrag] = useState(null);
  const [boxSize, setBoxSize] = useState({ width: 400, height: 600 });
  const points = {
    note0: useState({ x: 20, y: 20 }),
    note1: useState({ x: 20, y: 240 }),
  };
  const pointsRef = useRef();
  pointsRef.current = points;

  const onBoxResize = useCallback(size => {
    setBoxSize(size);
  }, []);

  const shouldStart = useCallback(
    ({ target }) => !!getDraggableKey(target),
    []
  );

  const onStart = useCallback(evt => {
    const key = getDraggableKey(evt.target);
    const startPoint = pointsRef.current[key][0];

    setDrag({ key, startPoint });
    console.log('onStart', evt);
  }, []);

  const onMove = useCallback(
    evt => {
      if (!drag) {
        return;
      }

      const setPoint = points[drag.key][1];

      setPoint({
        x: drag.startPoint.x + evt.translation.x,
        y: drag.startPoint.y + evt.translation.y,
      });
    },
    [drag]
  );

  const onEnd = useCallback(evt => {
    setDrag(null);
    console.log('onEnd', evt);
  }, []);

  const onCancel = useCallback(
    evt => {
      setDrag(null);

      if (drag) {
        const setPoint = points[drag.key][1];
        const point = drag.startPoint;

        setPoint(point);
      }

      setEnabled(true);
      console.log('onCancel', evt);
    },
    [drag]
  );

  useMemo(() => {
    setEnabled(panEnabled);
  }, [panEnabled]);

  const dragPoint = drag ? points[drag.key][0] : null;

  useMemo(() => {
    if (cancelsOut && enabled && dragPoint) {
      const maxPoint = {
        x: boxSize.width - 200,
        y: boxSize.height - 200,
      };

      if (
        dragPoint.x < 0 ||
        dragPoint.y < 0 ||
        dragPoint.x > maxPoint.x ||
        dragPoint.y > maxPoint.y
      ) {
        setEnabled(false);
      }
    }
  }, [cancelsOut, enabled, dragPoint, boxSize]);

  return (
    <AutoResizing height={600} onResize={onBoxResize}>
      <Pannable
        enabled={enabled}
        shouldStart={shouldStart}
        onStart={onStart}
        onMove={onMove}
        onEnd={onEnd}
        onCancel={onCancel}
        style={boxSize}
        className="pan-wrapper"
        data-dragbox="dragbox"
      >
        <div
          style={{
            ...convertTranslate(points['note0'][0]),
            willChange: 'transform',
          }}
          data-draggable="note0"
          className={clsx('pan-note', {
            'pan-note-dragging': drag && drag.key === 'note0',
          })}
        >
          <SvgNote className="pan-note-bg" />
          <div className="pan-note-content">
            <div className="pan-note-desc">You can drag me.</div>
            <div className="pan-note-desc">
              And you can{' '}
              <a href="https://github.com/n43/react-pannable" target="blank">
                open the link
              </a>
              .
            </div>
          </div>
        </div>
        <div
          style={{
            ...convertTranslate(points['note1'][0]),
            willChange: 'transform',
          }}
          className={clsx('pan-note', {
            'pan-note-dragging': drag && drag.key === 'note1',
          })}
        >
          <SvgNote className="pan-note-bg" />
          <div className="pan-note-content">
            <div data-draggable="note1" className="pan-note-trigger">
              Drag here
            </div>
            <div className="pan-note-desc">
              You can only drag me by trigger.
            </div>
          </div>
        </div>
      </Pannable>
    </AutoResizing>
  );
};

export default DraggableNotes;

function getDraggableKey(target) {
  if (target.dataset) {
    if (target.dataset.draggable) {
      return target.dataset.draggable;
    }

    if (target.dataset.dragbox) {
      return null;
    }
  }

  if (target.parentNode) {
    return getDraggableKey(target.parentNode);
  }

  return null;
}

function convertTranslate(translate) {
  return {
    transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`,
    WebkitTransform: `translate3d(${translate.x}px, ${translate.y}px, 0)`,
    msTransform: `translate(${translate.x}px, ${translate.y}px)`,
  };
}
