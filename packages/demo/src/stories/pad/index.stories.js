import React from 'react';
import { storiesOf } from '@storybook/react';
import BasicScroll from './BasicScroll';
import FillingParentSpace from './FillingParentSpace';
import GeneralContentLayout from './GeneralContentLayout';

storiesOf('Pad', module)
  .add('basic scroll', () => <BasicScroll />)
  .add('filling parent space', () => <FillingParentSpace />)
  .add('using general content layout', () => <GeneralContentLayout />);
