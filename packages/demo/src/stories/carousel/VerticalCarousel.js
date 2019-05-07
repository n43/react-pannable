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
  constructor(props) {
    super(props);

    this.state = {
      direction: 'y',
      activeIndex: 0,
      slideArr: [photo1, photo2, photo3, photo4, photo5],
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
              style={{ backgroundImage: `url(${slideArr[index]})` }}
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
    const { width, height } = getSize();

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
                height: '100%',
                backgroundImage: `url(${slideArr[itemIndex]})`,
                backgroundSize: 'cover',
              };

              return <div style={style} />;
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
