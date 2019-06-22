import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import RadioField from '../../ui/field/RadioField';
import { getSize } from './sizeGetter';
import './Pad.css';
import map from './media/map.jpg';

class LocatingContentArea extends Component {
  state = {
    scrollAlignX: 'auto',
    scrollAlignY: 'auto',
    size: getSize(),
    scrollToRect: null,
  };

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };
  handleScrollToPos = () => {
    const { scrollAlignX, scrollAlignY } = this.state;
    let align = { x: 'auto', y: 'auto' };

    if (
      scrollAlignX === 'start' ||
      scrollAlignX === 'center' ||
      scrollAlignX === 'end'
    ) {
      align.x = scrollAlignX;
    }
    if (
      scrollAlignY === 'start' ||
      scrollAlignY === 'center' ||
      scrollAlignY === 'end'
    ) {
      align.y = scrollAlignY;
    }

    this.setState({
      scrollToRect: {
        rect: { x: 854, y: 422, width: 120, height: 120 },
        align,
        animated: true,
      },
    });
  };

  render() {
    const { scrollAlignX, scrollAlignY, size, scrollToRect } = this.state;
    const scrollAlignXOptions = [
      { title: 'auto', value: 'auto', checked: scrollAlignX === 'auto' },
      { title: 'start', value: 'start', checked: scrollAlignX === 'start' },
      { title: 'center', value: 'center', checked: scrollAlignX === 'center' },
      { title: 'end', value: 'end', checked: scrollAlignX === 'end' },
    ];
    const scrollAlignYOptions = [
      { title: 'auto', value: 'auto', checked: scrollAlignY === 'auto' },
      { title: 'start', value: 'start', checked: scrollAlignY === 'start' },
      { title: 'center', value: 'center', checked: scrollAlignY === 'center' },
      { title: 'end', value: 'end', checked: scrollAlignY === 'end' },
    ];

    const { width, height } = size;

    return (
      <div className="pad-main">
        <div className="pad-preview" style={{ width, height }}>
          <Pad
            className="pad-padele"
            width={width}
            height={height}
            scrollToRect={scrollToRect}
          >
            <img src={map} width={1300} height={973} />
            <div
              style={{
                position: 'absolute',
                top: '422px',
                left: '854px',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                backgroundColor: 'rgba(245,177,177,0.5)',
              }}
            />
          </Pad>
        </div>
        <div className="pad-optbar">
          <RadioField
            name="scrollAlignX"
            options={scrollAlignXOptions}
            onChange={this.handleInputChange}
          />
          <RadioField
            name="scrollAlignY"
            options={scrollAlignYOptions}
            onChange={this.handleInputChange}
          />
          <div className="pad-btn" onClick={this.handleScrollToPos}>
            Locate Us
          </div>
        </div>
      </div>
    );
  }
}

export default LocatingContentArea;
