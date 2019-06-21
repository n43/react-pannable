import React, { Component } from 'react';
import { Carousel } from 'react-pannable';
import { getSize } from './sizeGetter';
import './Carousel.css';
import './VerticalCarousel.css';

import photo1 from './media/photo1.jpg';
import photo2 from './media/photo2.jpg';
import photo3 from './media/photo3.jpg';
import photo4 from './media/photo4.jpg';
import photo5 from './media/photo5.jpg';

class VerticalCarousel extends Component {
  state = {
    direction: 'y',
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
      <div className="vcarousel-pagination">
        {slideArr.map((item, index) => {
          return (
            <div
              key={index}
              className={
                activeIndex === index ? 'pagination-active' : 'pagination-item'
              }
              style={{ backgroundImage: `url(${slideArr[index]})` }}
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
        </div>
      </div>
    );
  }
}

export default VerticalCarousel;
