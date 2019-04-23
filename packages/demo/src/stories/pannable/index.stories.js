import React from 'react';
import { storiesOf } from '@storybook/react';
import Note from './Note';
import Sticker from './Sticker';

const basicSourceLink =
  'https://github.com/n43/react-pannable/blob/master/packages/demo/src/stories/pannable/';

storiesOf('Pannable', module)
  .add('Note', () => ({
    content: <Note />,
    source: basicSourceLink + 'Note.js',
  }))
  .add('Sticker', () => ({
    content: <Sticker />,
    source: basicSourceLink + 'Sticker.js',
  }));
