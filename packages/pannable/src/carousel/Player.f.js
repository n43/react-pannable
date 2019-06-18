import React from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';

const defaultPlayerProps = {
  ...Pad.defaultProps,
  direction: 'x',
    autoplayEnabled: true,
    autoplayInterval: 5000,
    loop: true,
    pagingEnabled: true,
    directionalLockEnabled: true,
};

function Player({
  direction =  defaultPlayerProps.direction,
    autoplayEnabled = defaultPlayerProps.autoplayEnabled,
    autoplayInterval = defaultPlayerProps.autoplayInterval,
    loop = defaultPlayerProps.loop,
    pagingEnabled = defaultPlayerProps.pagingEnabled,
    directionalLockEnabled= defaultPlayerProps.directionalLockEnabled,
    ...props,
}){
  
}

Player.defaultProps = defaultPadProps;
export default Player;
