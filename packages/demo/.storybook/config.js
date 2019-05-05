import React from 'react';
import { configure, addDecorator, addParameters } from '@storybook/react';
import 'normalize.css';
import Main from '../src/layout/Main';

addParameters({
  options: {
    showPanel: false,
    isToolshown: false,
    theme: {
      brandTitle: 'react-pannable',
      brandUrl: 'https://github.com/n43/react-pannable',
    },
  },
});

addDecorator(story => {
  const { content, source } = story();
  return <Main sourceLink={source}>{content}</Main>;
});

// const req = require.context('../src/stories', true, /\.stories\.js$/);

function loadStories() {
  // req.keys().forEach(filename => req(filename));
  require('../src/stories/carousel/index.stories');
  require('../src/stories/pad/index.stories');
  require('../src/stories/pannable/index.stories');
}

configure(loadStories, module);
