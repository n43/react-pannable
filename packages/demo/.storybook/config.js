import { configure, addParameters } from '@storybook/react';
import 'normalize.css';

addParameters({
  options: {
    showNav: true,
    isToolshown: false,
    showPanel: true,
    panelPosition: 'right',
    theme: {
      brandTitle: 'react-pannable',
      brandUrl: 'https://github.com/n43/react-pannable',
    },
    storySort(s1, s2) {
      return convertOrderFromStory(s1) < convertOrderFromStory(s2);
    },
  },
});

configure(require.context('../src/stories', true, /\.stories\.js$/), module);

function convertOrderFromStory(story) {
  const sid = story[0] || '';

  if (sid.indexOf('carousel-') === 0) {
    return 4;
  }
  if (sid.indexOf('infinite-') === 0) {
    return 3;
  }
  if (sid.indexOf('pad-') === 0) {
    return 2;
  }
  if (sid.indexOf('pannable-') === 0) {
    return 1;
  }

  return 0;
}
