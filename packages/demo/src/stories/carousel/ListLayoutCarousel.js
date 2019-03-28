import React, { Component } from 'react';
import { Carousel, ListContent } from 'react-pannable';
import SvgPrev from './SvgPrev';
import SvgNext from './SvgNext';
import './Carousel.css';
import './HorizontalCarousel.css';

class ListLayoutCarousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direction: 'x',
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
  handleSlideChange = ({ activeIndex }) => {
    this.setState({ activeIndex });
  };
  handlePaginationClick = index => {
    this.carouselRef.current.slideTo({ index });
  };

  render() {
    const { direction, activeIndex, slideArr } = this.state;

    return (
      <div className="carousel-main">
        <div className="carousel-box">
          <Carousel
            ref={this.carouselRef}
            width={750}
            height={300}
            direction={direction}
            loop={true}
            onSlideChange={this.handleSlideChange}
          >
            {carousel => {
              return (
                <ListContent
                  direction="x"
                  renderItem={({ itemIndex }) => {
                    // const style = {
                    //   display: 'flex',
                    //   alignItems: 'center',
                    //   justifyContent: 'center',
                    //   width: 750,
                    //   height: 300,
                    //   backgroundColor: slide % 2 ? '#defdff' : '#cbf1ff',
                    //   color: '#75d3ec',
                    //   fontSize: 24,
                    //   textAlign: 'center',
                    // };
                    return (
                      <div key={itemIndex}>slide {slideArr[itemIndex]}</div>
                    );
                  }}
                />
              );
            }}
          </Carousel>
          <SvgPrev
            className="carousel-box-prev"
            onClick={this.handleSlidePrev}
          />
          <SvgNext
            className="carousel-box-next"
            onClick={this.handleSlideNext}
          />
          <div className="hcarousel-pagination">
            {slideArr.map((item, index) => {
              return (
                <div
                  key={item}
                  className={
                    activeIndex === index
                      ? 'pagination-active'
                      : 'pagination-item'
                  }
                  onClick={() => this.handlePaginationClick(index)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default ListLayoutCarousel;
