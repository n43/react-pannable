import React from 'react';
import { storiesOf } from '@storybook/react';
import Autoplayer from './Autoplayer';
import HorizontalCarousel from './HorizontalCarousel';
import VerticalCarousel from './VerticalCarousel';

storiesOf('Carousel', module)
  .add('Pad with Autoplayer', () => <Autoplayer />)
  .add('Horizontal Carousel', () => <HorizontalCarousel />)
  .add('Vertical Carousel', () => <VerticalCarousel />);
