import React from 'react';
import { storiesOf } from '@storybook/react';
import Autoplayer from './Autoplayer';
import BasicCarousel from './BasicCarousel';

storiesOf('Carousel', module)
  .add('Pad with Autoplayer', () => <Autoplayer />)
  .add('Basic Carousel', () => <BasicCarousel />);
