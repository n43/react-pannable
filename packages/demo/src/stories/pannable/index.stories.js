import React, { Fragment, useState, useCallback, useMemo, useRef } from 'react';
import { AutoResizing, Pannable } from 'react-pannable';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import clsx from 'clsx';
import '../../ui/overview.css';
import './pan.css';
import SvgNote from './SvgNote';
import SvgScale from './SvgScale';
import SvgRotate from './SvgRotate';
import SvgPan from './SvgPan';
import SvgSticker from './SvgSticker';

export default {
  title: 'Pannable',
  decorators: [withKnobs],
};

export const Note = () => {
  const panEnabled = boolean('Drag Enabled', true);
  const cancelsOut = boolean('Cancels when Dragged Out the Container', true);

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
    <div className="overview-wrapper">
      <div className="overview-h1">Pannable</div>
      <div className="overview-desc">
        Pannable component can be panned(dragged) around with the touch/mouse.
        You can implement the event handlers for this gesture recognizer with
        current translation and velocity.
      </div>
      <div className="overview-content">
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
                  <a
                    href="https://github.com/n43/react-pannable"
                    target="blank"
                  >
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
      </div>
    </div>
  );
};

export const Sticker = () => {
  const [transform, setTransform] = useState({
    width: 300,
    height: 300,
    translateX: 20,
    translateY: 20,
    rotate: 0,
  });
  const [drag, setDrag] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const transformRef = useRef();
  transformRef.current = transform;

  const onDone = useCallback(() => {
    setEnabled(false);
  }, []);

  const onEdit = useCallback(() => {
    setEnabled(true);
  }, []);

  const shouldStart = useCallback(({ target }) => !!getDragAction(target), []);

  const onStart = useCallback(({ target }) => {
    const action = getDragAction(target);

    setDrag({ action, startTransform: transformRef.current });
  }, []);

  const onMove = useCallback(
    ({ translation }) => {
      if (!drag) {
        return;
      }

      const { action, startTransform } = drag;

      if (action === 'translate') {
        setTransform(prevTransform => ({
          ...prevTransform,
          translateX: startTransform.translateX + translation.x,
          translateY: startTransform.translateY + translation.y,
        }));
      }
      if (action === 'scale') {
        setTransform(prevTransform => ({
          ...prevTransform,
          width: Math.max(100, startTransform.width + translation.x),
          height: Math.max(100, startTransform.height + translation.y),
        }));
      }
      if (action === 'rotate') {
        setTransform(prevTransform => ({
          ...prevTransform,
          rotate: calculateRotate(startTransform, translation),
        }));
      }
    },
    [drag]
  );

  const onEnd = useCallback(() => {
    setDrag(null);
  }, []);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">Pannable</div>
      <div className="overview-desc">
        Pannable component can be panned(dragged) around with the touch/mouse.
        You can implement the event handlers for this gesture recognizer with
        current translation and velocity.
      </div>
      <div className="overview-content">
        <Pannable
          enabled={enabled}
          shouldStart={shouldStart}
          onStart={onStart}
          onMove={onMove}
          onEnd={onEnd}
          style={{
            ...convertTransform(transform),
            willChange: 'transform',
          }}
          className={clsx('pan-sticker', { 'pan-sticker-dragging': !!drag })}
          data-dragbox="dragbox"
        >
          <SvgSticker className="pan-sticker-image" />
          {enabled ? (
            <Fragment>
              <SvgPan
                data-action="translate"
                className="pan-sticker-translate"
              />
              <SvgScale data-action="scale" className="pan-sticker-scale" />
              <SvgRotate data-action="rotate" className="pan-sticker-rotate" />
              <div onClick={onDone} className="pan-sticker-edit">
                Done
              </div>
            </Fragment>
          ) : (
            <div onClick={onEdit} className="pan-sticker-edit">
              Edit
            </div>
          )}
        </Pannable>
      </div>
    </div>
  );
};

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

function getDragAction(target) {
  if (target.dataset) {
    if (target.dataset.action) {
      return target.dataset.action;
    }

    if (target.dataset.dragbox) {
      return null;
    }
  }

  if (target.parentNode) {
    return getDragAction(target.parentNode);
  }

  return null;
}

function calculateRotate({ rotate, width, height }, { x, y }) {
  const sr = 0.5 * Math.sqrt(width * width + height * height);
  const sx = -Math.cos(rotate - 0.25 * Math.PI) * sr;
  const sy = -Math.sin(rotate - 0.25 * Math.PI) * sr;
  const ex = sx + x;
  const ey = sy + y;
  const er = Math.sqrt(ex * ex + ey * ey);
  const redirect = ey >= 0 ? 1 : -1;

  return -redirect * Math.acos(-ex / er) + 0.25 * Math.PI;
}

function convertTranslate(translate) {
  return {
    transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`,
    WebkitTransform: `translate3d(${translate.x}px, ${translate.y}px, 0)`,
    msTransform: `translate(${translate.x}px, ${translate.y}px)`,
  };
}

function convertTransform(transform) {
  return {
    width: transform.width,
    height: transform.height,
    transform: `translate3d(${transform.translateX}px, ${transform.translateY}px, 0) rotate(${transform.rotate})`,
    WebkitTransform: `translate3d(${transform.translateX}px, ${transform.translateY}px, 0) rotate(${transform.rotate}rad)`,
    msTransform: `translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotate})`,
  };
}
