import React, { Component } from 'react';
import { Carousel, ListContent, ItemContent } from 'react-pannable';
import SvgPrev from './SvgPrev';
import SvgNext from './SvgNext';
import './Carousel.css';
import './HorizontalCarousel.css';

class ListLayoutCarousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direction: 'x',
      slideArr: [1, 2],
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

  render() {
    const { direction, slideArr } = this.state;
    return (
      <div className="carousel-main">
        <div className="carousel-box">
          <Carousel
            ref={this.carouselRef}
            width={750}
            height={300}
            direction={direction}
            loop={true}
            pagingEnabled={false}
            autoplayEnabled={false}
            renderIndicator={({ pageCount, activeIndex }) => {
              let indicators = [];
              for (let index = 0; index < pageCount; index++) {
                indicators.push(
                  <div
                    key={index}
                    className={
                      activeIndex === index
                        ? 'pagination-active'
                        : 'pagination-item'
                    }
                    onClick={() => this.handlePaginationClick(index)}
                  />
                );
              }
              return <div className="hcarousel-pagination">{indicators}</div>;
            }}
          >
            <ListContent
              direction="x"
              height={300}
              itemCount={slideArr.length}
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
                return (
                  <ItemContent width={300} height={300}>
                    <div style={style}>slide {slideArr[itemIndex]}</div>
                  </ItemContent>
                );
              }}
            />
          </Carousel>
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

export default ListLayoutCarousel;
