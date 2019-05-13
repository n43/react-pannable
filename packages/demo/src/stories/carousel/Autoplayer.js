import React, { Component } from 'react';
import { Player, GridContent } from 'react-pannable';
import { getSize } from './sizeGetter';
import './Carousel.css';

class Autoplayer extends Component {
  state = {
    direction: 'x',
    statusText: 'start',
    slideArr: [1, 2, 3, 4, 5, 6],
    size: getSize(),
  };

  playerRef = React.createRef();

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  handleStart = () => {
    this.playerRef.current.startAutoplay();
    this.setState({ statusText: 'start' });
  };

  handleStop = () => {
    this.playerRef.current.stopAutoplay();
    this.setState({ statusText: 'stop' });
  };

  render() {
    const { slideArr, size } = this.state;
    const { width, height } = size;

    return (
      <div className="carousel-main">
        <Player
          ref={this.playerRef}
          width={width}
          height={height}
          direction="x"
          loop={false}
          autoplayEnabled={true}
          style={{ margin: 'auto' }}
        >
          <GridContent
            width={width}
            height={height}
            direction="x"
            itemWidth={width}
            itemHeight={height}
            itemCount={slideArr.length}
            renderItem={({ itemIndex }) => {
              const style = {
                height: '100%',
                backgroundColor: itemIndex % 2 ? '#defdff' : '#cbf1ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#75d3ec',
                fontSize: 24,
                textAlign: 'center',
              };

              return <div style={style}>slide {slideArr[itemIndex]}</div>;
            }}
          />
        </Player>
        <div className="carousel-optbar">
          <div className="carsousel-status">
            Autoplay will stop when the mouse or finger is on it
          </div>
        </div>
      </div>
    );
  }
}

export default Autoplayer;
