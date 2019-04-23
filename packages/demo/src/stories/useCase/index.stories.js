import React from 'react';
import { storiesOf } from '@storybook/react';
import ProductMaster from './ProductMaster';

const basicSourceLink =
  'https://github.com/n43/react-pannable/blob/master/packages/demo/src/stories/useCase/';

storiesOf('UseCase', module).add('ProductMaster', () => ({
  content: <ProductMaster />,
  source: basicSourceLink + 'ProductMaster.js',
}));
