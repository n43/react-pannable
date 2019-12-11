import React from 'react';
import { storiesOf } from '@storybook/react';
import Autoplayer from './Autoplayer';
import HorizontalCarousel from './HorizontalCarousel';
import VerticalCarousel from './VerticalCarousel';

storiesOf('Carousel', module)
  .add('Horizontal Carousel', () => <HorizontalCarousel />)
  .add('Vertical Carousel', () => <VerticalCarousel />)
  .add('Pad with Autoplayer', () => <Autoplayer />);
