import React from 'react';
import { storiesOf } from '@storybook/react';
import BasicScroll from './BasicScroll';
import LocatingContentArea from './LocatingContentArea';
import AutoResizingPad from './AutoResizingPad';
import GeneralContentLayout from './GeneralContentLayout';
import GridContentLayout from './GridContentLayout';
import NestedMutipleContent from './NestedMutipleContent';
import ProductMaster from './ProductMaster';

storiesOf('Pad', module)
  .add('Scrollable Content', () => <BasicScroll />)
  .add('Locating Specified Content', () => <LocatingContentArea />)
  .add('Auto Resizing with Pad', () => <AutoResizingPad />)
  .add('Layout with General Content', () => <GeneralContentLayout />)
  .add('Layout with Grid Content', () => <GridContentLayout />)
  .add('Layout with Nested Content', () => <NestedMutipleContent />)
  .add('Use Case with List Content', () => <ProductMaster />);
