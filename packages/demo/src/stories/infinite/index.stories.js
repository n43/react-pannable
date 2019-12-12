import React, { useCallback } from 'react';
import { withKnobs, object, number, select } from '@storybook/addon-knobs';
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
  { id: 'p001', linesOfDesc: 9 },
  { id: 'p002', linesOfDesc: 13 },
  { id: 'p003', linesOfDesc: 7 },
  { id: 'p004', linesOfDesc: 7 },
  { id: 'p005', linesOfDesc: 11 },
  { id: 'p006', linesOfDesc: 8 },
  { id: 'p007', linesOfDesc: 10 },
  { id: 'p008', linesOfDesc: 7 },
  { id: 'p009', linesOfDesc: 15 },
  { id: 'p010', linesOfDesc: 11 },
  { id: 'p011', linesOfDesc: 12 },
  { id: 'p012', linesOfDesc: 6 },
  { id: 'p013', linesOfDesc: 8 },
  { id: 'p014', linesOfDesc: 14 },
  { id: 'p015', linesOfDesc: 14 },
  { id: 'p016', linesOfDesc: 6 },
  { id: 'p017', linesOfDesc: 7 },
  { id: 'p018', linesOfDesc: 9 },
  { id: 'p019', linesOfDesc: 10 },
  { id: 'p020', linesOfDesc: 13 },
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
  const scrollToIndex = object(
    'scrollToIndex',
    {
      index: 0,
      align: 'auto',
      animated: false,
    },
    'props'
  );

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
