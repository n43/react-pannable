import { Point } from '../interfaces';
import React from 'react';

export interface CSSProperties extends React.CSSProperties {
  transformTranslate?: Point;
  userSelectNone?: boolean;
}

function convertTransformTranslate(
  translate: Point,
  style: React.CSSProperties
) {
  style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0)`;
  style.WebkitTransform = `translate3d(${translate.x}px, ${translate.y}px, 0)`;
  style.msTransform = `translate(${translate.x}px, ${translate.y}px)`;
}

function convertUserSelect(style: React.CSSProperties) {
  style.userSelect = 'none';
  style.WebkitUserSelect = 'none';
  style.MozUserSelect = 'none';
  style.msUserSelect = 'none';
}

function create(styles: CSSProperties): React.CSSProperties {
  const { transformTranslate, userSelectNone, ...style } = styles;

  if (transformTranslate) {
    convertTransformTranslate(transformTranslate, style);
  }
  if (userSelectNone) {
    convertUserSelect(style);
  }

  return style;
}

const StyleSheet = { create };

export default StyleSheet;
