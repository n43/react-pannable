import React from 'react';
import { storiesOf } from '@storybook/react';
import BasicScroll from './BasicScroll';
import LocatingContentArea from './LocatingContentArea';
import AutoResizingPad from './AutoResizingPad';
import GeneralContentLayout from './GeneralContentLayout';
import GridContentLayout from './GridContentLayout';
import ListContentLayout from './ListContentLayout';
import NestedMutipleContent from './NestedMutipleContent';

const basicSourceLink =
  'https://github.com/n43/react-pannable/blob/master/packages/demo/src/stories/pad/';

storiesOf('Pad', module)
  .add('Scrollable Content', () => ({
    content: <BasicScroll />,
    source: basicSourceLink + 'BasicScroll.js',
  }))
  .add('Locating Specified Content', () => ({
    content: <LocatingContentArea />,
    source: basicSourceLink + 'LocatingContentArea.js',
  }))
  .add('Auto Resizing with Pad', () => ({
    content: <AutoResizingPad />,
    source: basicSourceLink + 'AutoResizingPad.js',
  }))
  .add('Layout with General Content', () => ({
    content: <GeneralContentLayout />,
    source: basicSourceLink + 'GeneralContentLayout.js',
  }))
  .add('Layout with Grid Content', () => ({
    content: <GridContentLayout />,
    source: basicSourceLink + 'GridContentLayout.js',
  }))
  .add('Layout with List Content', () => ({
    content: <ListContentLayout />,
    source: basicSourceLink + 'ListContentLayout.js',
  }))
  .add('Layout with Nested Content', () => ({
    content: <NestedMutipleContent />,
    source: basicSourceLink + 'NestedMutipleContent.js',
  }));
