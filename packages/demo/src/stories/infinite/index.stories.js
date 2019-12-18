import React, { useCallback, useMemo } from 'react';
import {
  withKnobs,
  object,
  number,
  select,
  boolean,
} from '@storybook/addon-knobs';
import { AutoResizing, Infinite } from 'react-pannable';
import InfoCard from './Infocard';
import Banner from './Banner';
import '../../ui/overview.css';
import './infinite.css';

export default {
  title: 'Infinite',
  decorators: [withKnobs],
};

const data = [
  { id: 'p001', title: 'Item 0', linesOfDesc: 9 },
  { id: 'p002', title: 'Item 1', linesOfDesc: 13 },
  { id: 'p003', title: 'Item 2', linesOfDesc: 7 },
  { id: 'p004', title: 'Item 3', linesOfDesc: 7 },
  { id: 'p005', title: 'Item 4', linesOfDesc: 11 },
  { id: 'p006', title: 'Item 5', linesOfDesc: 8 },
  { id: 'p007', title: 'Item 6', linesOfDesc: 10 },
  { id: 'p008', title: 'Item 7', linesOfDesc: 7 },
  { id: 'p009', title: 'Item 8', linesOfDesc: 15 },
  { id: 'p010', title: 'Item 9', linesOfDesc: 11 },
  { id: 'p011', title: 'Item 10', linesOfDesc: 12 },
  { id: 'p012', title: 'Item 11', linesOfDesc: 6 },
  { id: 'p013', title: 'Item 12', linesOfDesc: 8 },
  { id: 'p014', title: 'Item 13', linesOfDesc: 14 },
  { id: 'p015', title: 'Item 14', linesOfDesc: 14 },
  { id: 'p016', title: 'Item 15', linesOfDesc: 6 },
  { id: 'p017', title: 'Item 16', linesOfDesc: 7 },
  { id: 'p018', title: 'Item 17', linesOfDesc: 9 },
  { id: 'p019', title: 'Item 18', linesOfDesc: 10 },
  { id: 'p020', title: 'Item 19', linesOfDesc: 13 },
];

export const Overview = () => {
  const spacing = number('spacing', 16, {}, 'props');
  const list = object('Data List', data);
  const header = select(
    'renderHeader',
    { 'No Header': undefined, 'Hello World': 'Hello World' },
    undefined,
    'props'
  );
  const footer = select(
    'renderFooter',
    { 'No Footer': undefined, 'loading...': 'loading...' },
    undefined,
    'props'
  );

  const scrollType = select(
    'Scroll Action',
    { null: '', scrollToIndex: 'scrollToIndex' },
    '',
    'Scrolling'
  );
  let index;
  let align;
  let animated;

  if (scrollType === 'scrollToIndex') {
    index = number('index', 0, {}, 'Scrolling');
    align = select(
      'align',
      { center: 'center', start: 'start', end: 'end', auto: 'auto' },
      'center',
      'Scrolling'
    );
    animated = boolean('animated', true, 'Scrolling');
  }

  const scrollToIndex = useMemo(() => {
    if (scrollType !== 'scrollToIndex') {
      return null;
    }

    return { index, align, animated };
  }, [scrollType, index, align, animated]);

  const renderItem = useCallback(
    ({ itemIndex, Item }) => {
      const info = list[itemIndex];

      return (
        <Item hash={`${info.id}-${info.linesOfDesc}`}>
          <InfoCard info={info} />
        </Item>
      );
    },
    [list]
  );

  const renderHeader = useCallback(
    ({ Item }) => {
      if (header) {
        return (
          <Item hash={header}>
            <Banner>{header}</Banner>
          </Item>
        );
      }

      return null;
    },
    [header]
  );

  const renderFooter = useCallback(
    ({ Item }) => {
      if (footer) {
        return (
          <Item hash={footer}>
            <Banner>{footer}</Banner>
          </Item>
        );
      }

      return null;
    },
    [footer]
  );

  return (
    <div className="overview-wrapper">
      <div className="overview-h1">Infinite</div>
      <div className="overview-desc">
        Infinite component used to display a long list of data.
      </div>
      <div className="overview-content infinite-wrapper">
        <AutoResizing>
          {({ width, height }) => (
            <Infinite
              width={width}
              height={height}
              direction="y"
              spacing={spacing}
              itemCount={list.length}
              estimatedItemHeight={500}
              renderItem={renderItem}
              renderHeader={renderHeader}
              renderFooter={renderFooter}
              scrollToIndex={scrollToIndex}
            />
          )}
        </AutoResizing>
      </div>
    </div>
  );
};
