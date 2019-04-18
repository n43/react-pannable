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
  componentDidMount() {
    this.carouselRef.current.slideTo({ index: 3, animated: false });
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

              return <div style={style}>slide {slide}</div>;
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
