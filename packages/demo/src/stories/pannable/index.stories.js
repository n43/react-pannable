import React from 'react';
import { storiesOf } from '@storybook/react';
import Note from './Note';
import Sticker from './Sticker';

storiesOf('Pannable', module)
  .add('Note', () => <Note />)
  .add('Sticker', () => <Sticker />);
