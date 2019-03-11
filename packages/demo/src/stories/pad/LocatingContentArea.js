import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from '../../ui/field/TextField';
import RadioField from '../../ui/field/RadioField';
import './Pad.css';
import map from './map.jpg';

class LocatingContentArea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scrollAlignX: 'auto',
      scrollAlignY: 'auto',
    };
    this.padRef = React.createRef();
  }
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
      scrollAlignX === 'start' ||
      scrollAlignX === 'center' ||
      scrollAlignX === 'end'
    ) {
      align.y = scrollAlignY;
    }

    this.padRef.current.scrollToRect({
      rect: { x: 748, y: 325, width: 120, height: 120 },
      align,
      animated: true,
    });
  };

  render() {
    const { scrollAlignX, scrollAlignY } = this.state;
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

    return (
      <div className="pad-main">
        <div className="pad-preview">
          <SvgPhone className="pad-preview-bg" />
          <div className="pad-preview-content">
            <Pad
              ref={this.padRef}
              width={346}
              height={552}
              contentWidth={1024}
              contentHeight={810}
            >
              <React.Fragment>
                <img src={map} />
                <div
                  style={{
                    position: 'absolute',
                    top: '325px',
                    left: '748px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '60px',
                    backgroundColor: 'rgba(245,177,177,0.5)',
                  }}
                />
              </React.Fragment>
            </Pad>
          </div>
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
