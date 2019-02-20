import { configure, addDecorator } from '@storybook/react';
import { withOptions } from '@storybook/addon-options';

addDecorator(
  withOptions({
    name: 'react-pannable',
    url: 'https://github.com/n43/react-pannable',
    showAddonPanel: false,
  })
);

// automatically import all files ending in *.stories.js
const req = require.context('../stories/', true, /.stories.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
