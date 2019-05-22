import React from 'react';
import { storiesOf } from '@storybook/react';
import Autoplayer from './Autoplayer';
import HorizontalCarousel from './HorizontalCarousel';
import VerticalCarousel from './VerticalCarousel';

const basicSourceLink =
  'https://github.com/n43/react-pannable/blob/master/packages/demo/src/stories/carousel/';

storiesOf('Carousel', module)
  .add('Horizontal Carousel', () => ({
    content: <HorizontalCarousel />,
    source: basicSourceLink + 'HorizontalCarousel.js',
  }))
  .add('Vertical Carousel', () => ({
    content: <VerticalCarousel />,
    source: basicSourceLink + 'VerticalCarousel.js',
  }))
  .add('Pad with Autoplayer', () => ({
    content: <Autoplayer />,
    source: basicSourceLink + 'Autoplayer.js',
  }));
