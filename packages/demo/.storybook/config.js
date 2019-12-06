import React from 'react';
import { configure, addDecorator, addParameters } from '@storybook/react';
import Main from '../src/layout/Main';

addParameters({
  options: {
    theme: {
      brandTitle: 'react-pannable',
      brandUrl: 'https://github.com/n43/react-pannable',
    },
  },
});

addDecorator(storyFn => {
  return <Main>{storyFn()}</Main>;
});

configure(require.context('../src/stories', true, /\.stories\.js$/), module);
