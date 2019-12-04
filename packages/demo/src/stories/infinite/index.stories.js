import React from 'react';
import { storiesOf } from '@storybook/react';
import ListContentLayout from './ListContentLayout';

const basicSourceLink =
  'https://github.com/n43/react-pannable/blob/master/packages/demo/src/stories/infinite/';

storiesOf('Infinite', module).add('Infinit Scrolling Content', () => ({
  content: <ListContentLayout />,
  source: basicSourceLink + 'ListContentLayout.js',
}));
