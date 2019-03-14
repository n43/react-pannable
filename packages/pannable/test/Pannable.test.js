import React from 'react';
import Pannable from '../src/Pannable';
import renderer from 'react-test-renderer';

test('Pannable test', () => {
  const component = renderer.create(<Pannable />);
  const pannable = component.getInstance();

  expect(pannable.props.enabled).toBe(true);
});
