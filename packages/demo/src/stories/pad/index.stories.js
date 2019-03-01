import React from 'react';
import { storiesOf } from '@storybook/react';
import BasicScroll from './BasicScroll';
import FillingParentSpace from './FillingParentSpace';
import GeneralContentLayout from './GeneralContentLayout';

storiesOf('Pad', module)
  .add('Scrollable Content', () => <BasicScroll />)
  .add('Auto Resizing', () => <FillingParentSpace />)
  .add('Layout with General Content Mode', () => <GeneralContentLayout />);
