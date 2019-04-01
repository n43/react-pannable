import React, { Component } from 'react';
import { Carousel } from 'react-pannable';
import SvgPrev from './SvgPrev';
import SvgNext from './SvgNext';
import './Carousel.css';
import './HorizontalCarousel.css';

class HorizontalCarousel extends Component {
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

  renderContent() {
    const { direction, slideArr } = this.state;
    const items = [];

    for (let slide = 0; slide < slideArr.length; slide++) {
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
          slide {slideArr[slide]}
        </div>
      );
    }

    return items;
  }

  render() {
    const { direction, activeIndex, slideArr } = this.state;

    return (
      <div className="carousel-main">
        <div className="carousel-box">
          <Carousel
            ref={this.carouselRef}
            width={750}
            height={300}
            contentWidth={direction === 'x' ? 750 * 6 : 750}
            contentHeight={direction === 'x' ? 300 : 300 * 6}
            direction={direction}
            loop={true}
            onSlideChange={this.handleSlideChange}
          >
            <div
              style={{
                position: 'relative',
                width: direction === 'x' ? 750 * 6 : 750,
                height: direction === 'x' ? 300 : 300 * 6,
              }}
            >
              {this.renderContent()}
            </div>
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

export default HorizontalCarousel;
