import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import BasicScroll from './src/BasicScroll';
import AutoAdjustsContentSize from './src/AutoAdjustsContentSize';

const CenterDecorator = storyFn => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>{storyFn()}</div>
);
addDecorator(CenterDecorator);

storiesOf('scrollview', module)
  .add('basic scroll', () => <BasicScroll />)
  .add('automatically adjust content size', () => <AutoAdjustsContentSize />);
