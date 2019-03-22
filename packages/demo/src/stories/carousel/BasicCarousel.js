import React, { Component } from 'react';
import { Carousel } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import RadioField from '../../ui/field/RadioField';
import './Carousel.css';

class BasicCarousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direction: 'x',
    };
    this.carouselRef = React.createRef();
  }
  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };
  handleSlidePrev = () => {
    this.carouselRef.current.slidePrev();
  };
  handleSlideNext = () => {
    this.carouselRef.current.slideNext();
  };

  renderContent() {
    const { direction } = this.state;
    const items = [];

    for (let slide = 0; slide < 6; slide++) {
      const style = {
        position: 'absolute',
        top: direction === 'x' ? 0 : slide * 300,
        left: direction === 'x' ? slide * 750 : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 750,
        height: 300,
        backgroundColor: slide % 2 ? '#defdff' : '#cbf1ff',
        color: '#75d3ec',
        fontSize: 24,
        textAlign: 'center',
      };

      items.push(
        <div key={slide} style={style}>
          slide {slide}
        </div>
      );
    }

    return items;
  }

  render() {
    const { direction } = this.state;

    // const directionOptions = [
    //   { title: 'x', value: 'x', checked: direction === 'x' },
    //   { title: 'y', value: 'y', checked: direction === 'y' },
    // ];

    return (
      <div className="carousel-main">
        <Carousel
          ref={this.carouselRef}
          width={750}
          height={300}
          contentWidth={direction === 'x' ? 750 * 6 : 750}
          contentHeight={direction === 'x' ? 300 : 300 * 6}
          direction={direction}
          loop={true}
        >
          {this.renderContent()}
        </Carousel>
        <div className="carousel-optbar">
          <button onClick={this.handleSlidePrev}>prev</button>
          <button onClick={this.handleSlideNext}>next</button>
          {/* <RadioField
            name="direction"
            options={directionOptions}
            onChange={this.handleInputChange}
          /> */}
        </div>
      </div>
    );
  }
}

export default BasicCarousel;
