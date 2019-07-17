import React, { Component, Fragment } from 'react';
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
    slideArr: [photo1, photo2, photo3, photo4, photo5],
    size: getSize(),
    slideTo: null,
  };

  handleSlidePrev = () => {
    this.setState({
      slideTo: {
        index: ({ activeIndex, itemCount }) =>
          activeIndex > 0 ? activeIndex - 1 : itemCount - 1,
        animated: true,
      },
    });
  };
  handleSlideNext = () => {
    this.setState({
      slideTo: {
        index: ({ activeIndex, itemCount }) =>
          activeIndex < itemCount - 1 ? activeIndex + 1 : 0,
        animated: true,
      },
    });
  };
  handlePaginationClick = index => {
    this.setState({ slideTo: { index, animated: true } });
  };

  renderIndicator(activeIndex) {
    const { slideArr } = this.state;

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
    const { slideArr, size, slideTo } = this.state;
    const itemLength = slideArr.length;
    const { width, height } = size;

    return (
      <div className="carousel-main">
        <div className="carousel-box" style={{ width, height }}>
          <Carousel
            width={width}
            height={height}
            direction="x"
            itemCount={itemLength}
            renderItem={({ itemIndex }) => {
              const style = {
                backgroundImage: `url(${slideArr[itemIndex]})`,
                backgroundSize: 'cover',
              };

              return <div style={style} />;
            }}
            slideTo={slideTo}
          >
            {({ activeIndex }) => {
              return (
                <Fragment>
                  {this.renderIndicator(activeIndex)}
                  <SvgPrev
                    className="carousel-box-prev"
                    onClick={this.handleSlidePrev}
                  />
                  <SvgNext
                    className="carousel-box-next"
                    onClick={this.handleSlideNext}
                  />
                </Fragment>
              );
            }}
          </Carousel>
        </div>
      </div>
    );
  }
}

export default HorizontalCarousel;
