import React from 'react';
import { storiesOf } from '@storybook/react';
import BasicScroll from './BasicScroll';
import AutoAdjustsContentSize from './AutoAdjustsContentSize';

storiesOf('Pad', module)
  .add('basic scroll', () => <BasicScroll />)
  .add('automatically adjust content size', () => <AutoAdjustsContentSize />);
