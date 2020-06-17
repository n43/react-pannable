import React, { useState, useCallback, useMemo } from 'react';
import { withKnobs, object, boolean, select } from '@storybook/addon-knobs';
import { AutoResizing, Loop, ItemContent } from 'react-pannable';
import HorizontalIndicator from './HorizontalIndicator';
import VerticalIndicator from './VerticalIndicator';
import '../../ui/overview.css';
import photo1 from './photo1.jpg';
import photo2 from './photo2.jpg';
import photo3 from './photo3.jpg';
import photo4 from './photo4.jpg';
import photo5 from './photo5.jpg';

export default {
  title: 'Carousel',
  decorators: [withKnobs],
};

const data = [
  { url: photo1 },
  { url: photo2 },
  { url: photo3 },
  { url: photo4 },
  { url: photo5 },
];

export const LoopDemo = () => {
  const direction = select('direction', { x: 'x', y: 'y' }, 'x', 'props');
  const scrollType = select(
    'Scroll Action',
    { null: '', scrollTo: 'scrollTo' },
    '',
    'Scrolling'
  );

  let point;
  let rect;
  let align;
  let animated;

  if (scrollType === 'scrollTo') {
    point = object('point', undefined, 'Scrolling');
    rect = object('rect', undefined, 'Scrolling');
    align = select(
      'align',
      { auto: 'auto', center: 'center', end: 'end', start: 'start' },
      'start',
      'Scrolling'
    );
    animated = boolean('animated ', true, 'Scrolling');
  }

  const scrollTo = useMemo(() => {
    if (scrollType !== 'scrollTo') {
      return null;
    }

    return { point, rect, align, animated };
  }, [scrollType, point, rect, align, animated]);

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">Loop</div>
      <div className="overview-desc">
        Loop component used to play a number of looping items in sequence.
      </div>
      <div className="overview-content">
        <AutoResizing>
          {({ width }) => {
            const height = Math.ceil((width * 8) / 15.0);

            return (
              <Loop
                width={width}
                height={height}
                direction={direction}
                scrollTo={scrollTo}
              >
                <ItemContent width={width} height={height}>
                  <img
                    src={photo1}
                    width={width}
                    height={height}
                    style={{ display: 'block' }}
                  />
                </ItemContent>
              </Loop>
            );
          }}
        </AutoResizing>
      </div>
    </div>
  );
};

// export const HorizontalCarousel = () => {
//   const loop = boolean('loop', true, 'props');
//   const autoplayEnabled = boolean('autoplayEnabled', true, 'props');
//   const autoplayInterval = select(
//     'autoplayInterval',
//     {
//       '5000': 5000,
//       '3000': 3000,
//       '1000': 1000,
//     },
//     5000,
//     'props'
//   );
//   const list = object('Data List', data);

//   const [scrollToIndex, setScrollToIndex] = useState(null);

//   const renderItem = useCallback(
//     ({ itemIndex }) => {
//       const item = list[itemIndex];

//       return <img src={item.url} width="100%" height="100%" />;
//     },
//     [list]
//   );

//   const onIndicatorPrev = useCallback(() => {
//     setScrollToIndex({
//       index: ({ activeIndex }) => activeIndex - 1,
//       animated: true,
//     });
//   }, []);

//   const onIndicatorNext = useCallback(() => {
//     setScrollToIndex({
//       index: ({ activeIndex }) => activeIndex + 1,
//       animated: true,
//     });
//   }, []);

//   const onIndicatorGoto = useCallback(index => {
//     setScrollToIndex({ index, animated: true });
//   }, []);

//   return (
//     <div className="overview-wrapper">
//       <div className="overview-h1">Carousel</div>
//       <div className="overview-desc">
//         Carousel component used to play a number of looping items in sequence.
//       </div>
//       <div className="overview-content">
//         <AutoResizing>
//           {({ width }) => {
//             const height = Math.ceil((width * 8) / 15.0);

//             return (
//               <Carousel
//                 width={width}
//                 height={height}
//                 direction="x"
//                 loop={loop}
//                 autoplayEnabled={autoplayEnabled}
//                 autoplayInterval={autoplayInterval}
//                 itemCount={list.length}
//                 renderItem={renderItem}
//                 scrollToIndex={scrollToIndex}
//               >
//                 {({ activeIndex, itemCount }) => (
//                   <HorizontalIndicator
//                     activeIndex={activeIndex}
//                     itemCount={itemCount}
//                     onPrev={onIndicatorPrev}
//                     onNext={onIndicatorNext}
//                     onGoto={onIndicatorGoto}
//                   />
//                 )}
//               </Carousel>
//             );
//           }}
//         </AutoResizing>
//       </div>
//     </div>
//   );
// };

// export const VerticalCarousel = () => {
//   const loop = boolean('loop', true, 'props');
//   const autoplayEnabled = boolean('autoplayEnabled', true, 'props');
//   const autoplayInterval = select(
//     'autoplayInterval',
//     {
//       '5000': 5000,
//       '3000': 3000,
//       '1000': 1000,
//     },
//     5000,
//     'props'
//   );
//   const list = object('Data List', data);

//   const [scrollToIndex, setScrollToIndex] = useState(null);

//   const renderItem = useCallback(
//     ({ itemIndex }) => {
//       const item = list[itemIndex];

//       return <img src={item.url} width="100%" height="100%" />;
//     },
//     [list]
//   );

//   const onIndicatorGoto = useCallback(index => {
//     setScrollToIndex({ index, animated: true });
//   }, []);

//   return (
//     <div className="overview-wrapper">
//       <div className="overview-h1">Carousel</div>
//       <div className="overview-desc">
//         Carousel component used to play a number of looping items in sequence.
//       </div>
//       <div className="overview-content">
//         <AutoResizing>
//           {({ width }) => {
//             const height = Math.ceil((width * 8) / 15.0);

//             return (
//               <Carousel
//                 width={width}
//                 height={height}
//                 direction="y"
//                 loop={loop}
//                 autoplayEnabled={autoplayEnabled}
//                 autoplayInterval={autoplayInterval}
//                 itemCount={list.length}
//                 renderItem={renderItem}
//                 scrollToIndex={scrollToIndex}
//               >
//                 {({ activeIndex }) => (
//                   <VerticalIndicator
//                     activeIndex={activeIndex}
//                     list={list}
//                     width={width}
//                     height={height}
//                     onGoto={onIndicatorGoto}
//                   />
//                 )}
//               </Carousel>
//             );
//           }}
//         </AutoResizing>
//       </div>
//     </div>
//   );
// };
