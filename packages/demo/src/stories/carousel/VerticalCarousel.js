import React, { Component } from 'react';
import { Carousel } from 'react-pannable';
import './Carousel.css';
import './VerticalCarousel.css';

class VerticalCarousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direction: 'y',
      activeIndex: 0,
      slideArr: [1, 2, 3, 4, 5, 6],
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
  handlePaginationClick = index => {
    this.carouselRef.current.slideTo({ index });
  };
  handleSlideChange = ({ activeIndex }) => {
    this.setState({ activeIndex });
  };

  renderIndicator() {
    const { slideArr, activeIndex } = this.state;

    return (
      <div className="vcarousel-pagination">
        {slideArr.map((item, index) => {
          return (
            <div
              key={index}
              className={
                activeIndex === index ? 'pagination-active' : 'pagination-item'
              }
              onClick={() => this.handlePaginationClick(index)}
            />
          );
        })}
      </div>
    );
  }

  render() {
    const { direction, slideArr } = this.state;
    const itemLength = slideArr.length;

    return (
      <div className="carousel-main">
        <div className="carousel-box">
          <Carousel
            ref={this.carouselRef}
            width={750}
            height={300}
            direction={direction}
            loop={true}
            itemCount={itemLength}
            renderItem={({ itemIndex }) => {
              const style = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: itemIndex % 2 ? '#defdff' : '#cbf1ff',
                color: '#75d3ec',
                fontSize: 24,
                textAlign: 'center',
              };
              const slide = slideArr[itemIndex];

              return (
                <div key={slide} style={style}>
                  slide {slide}
                </div>
              );
            }}
            onSlideChange={this.handleSlideChange}
          />
          {this.renderIndicator()}
        </div>
      </div>
    );
  }
}

export default VerticalCarousel;
