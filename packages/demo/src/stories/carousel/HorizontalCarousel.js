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
  constructor(props) {
    super(props);

    this.state = {
      direction: 'x',
      activeIndex: 0,
      slideArr: [photo1, photo2, photo3, photo4, photo5],
      size: getSize(),
    };
    this.carouselRef = React.createRef();
  }
  componentDidMount() {
    //this.carouselRef.current.slideTo({ index: 3, animated: false });
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
    const { direction, slideArr, size } = this.state;
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
            renderItem={({ itemIndex, Item }) => {
              const style = {
                height: '100%',
                backgroundImage: `url(${slideArr[itemIndex]})`,
                backgroundSize: 'cover',
              };

              return (
                <Item forceRender>
                  <div style={style}>
                    <a href="http://www.baidu.com">test</a>
                  </div>
                </Item>
              );
            }}
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
