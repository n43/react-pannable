import React, { Component } from 'react';
import { Carousel } from 'react-pannable';
import SvgPrev from './SvgPrev';
import SvgNext from './SvgNext';
import { getSize } from './sizeGetter';
import './Carousel.css';
import './HorizontalCarousel.css';

import photo1 from './media/photo1.jpg';
import photo2 from './media/photo2.jpg';
import photo3 from './media/photo3.jpg';
import photo4 from './media/photo4.jpg';
import photo5 from './media/photo5.jpg';

class HorizontalCarousel extends Component {
  state = {
    direction: 'x',
    activeIndex: 0,
    slideArr: [photo1, photo2, photo3, photo4, photo5],
    size: getSize(),
    slideTo: null,
  };

  handleSlidePrev = () => {
    this.setState({ slideTo: { prev: true, animated: true } });
  };
  handleSlideNext = () => {
    this.setState({ slideTo: { next: true, animated: true } });
  };
  handlePaginationClick = index => {
    this.setState({ slideTo: { index, animated: true } });
  };
  handleSlideChange = ({ activeIndex }) => {
    this.setState({ activeIndex });
  };

  renderIndicator() {
    const { slideArr, activeIndex } = this.state;

    return (
      <div className="hcarousel-pagination">
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
    const { direction, slideArr, size, slideTo } = this.state;
    const itemLength = slideArr.length;
    const { width, height } = size;

    return (
      <div className="carousel-main">
        <div className="carousel-box" style={{ width, height }}>
          <Carousel
            ref={this.carouselRef}
            width={width}
            height={height}
            direction={direction}
            loop={true}
            itemCount={itemLength}
            renderItem={({ itemIndex }) => {
              const style = {
                backgroundImage: `url(${slideArr[itemIndex]})`,
                backgroundSize: 'cover',
              };

              return <div style={style} />;
            }}
            slideTo={slideTo}
            onSlideChange={this.handleSlideChange}
          />

          {this.renderIndicator()}
          <SvgPrev
            className="carousel-box-prev"
            onClick={this.handleSlidePrev}
          />
          <SvgNext
            className="carousel-box-next"
            onClick={this.handleSlideNext}
          />
        </div>
      </div>
    );
  }
}

export default HorizontalCarousel;
