import React from 'react';
import { storiesOf } from '@storybook/react';
import BasicScroll from './BasicScroll';
import AutoResizingPad from './AutoResizingPad';
import GeneralContentLayout from './GeneralContentLayout';
import GridContentLayout from './GridContentLayout';

storiesOf('Pad', module)
  .add('Scrollable Content', () => <BasicScroll />)
  .add('Auto Resizing with Pad', () => <AutoResizingPad />)
  .add('Layout with General Content Mode', () => <GeneralContentLayout />)
  .add('Layout with Grid Content Mode', () => <GridContentLayout />);
