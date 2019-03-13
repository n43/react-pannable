import React, { Component } from 'react';
import { Carousel } from 'react-pannable';
import TextField from '../../ui/field/TextField';
// import './BasicCarousel.css';

class BasicCarousel extends Component {
  state = {
    headerHeight: 50,
    padWidth: -1,
    padHeight: -1,
  };

  handleInputChange = evt => {
    const node = evt.target;
    const value = parseInt(node.value, 10);
    if (isNaN(value)) {
      return;
    }

    this.setState({
      [node.name]: value,
    });
  };

  render() {
    const images = [1, 2];
    return (
      <div className="pad-main">
        <Carousel
          direction="horizontal"
          width={600}
          height={400}
          itemWidth={600}
          itemHeight={400}
        >
          {images.map(item => {
            let backgroundColor = item % 2 ? '#defdff' : '#cbf1ff';
            return (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '600px',
                  height: '400px',
                  backgroundColor: backgroundColor,
                  color: '#75d3ec',
                  fontSize: '28px',
                }}
              >
                slide {item}
              </div>
            );
          })}
        </Carousel>
        {/* <div className="pad-preview">
            
          </div>
          <div className="pad-optbar">
            <TextField
              name="headerHeight"
              defaultValue={headerHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="padWidth"
              defaultValue={padWidth}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="padHeight"
              defaultValue={padHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            /> */}
      </div>
    );
  }
}

export default BasicCarousel;
