import React, { Component } from 'react';
import { Player } from 'react-pannable';
import './Carousel.css';

class Autoplayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direction: 'x',
      statusText: 'start',
      slideArr: [1, 2, 3, 4, 5],
    };
    this.playerRef = React.createRef();
  }
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
    const { direction, statusText } = this.state;

    return (
      <div className="carousel-main">
        <Player
          ref={this.playerRef}
          width={750}
          height={300}
          contentWidth={750 * 5}
          contentHeight={300}
          direction="x"
        >
          <div style={{ width: 750 * 5, height: 300 }}>
            {this.renderContent()}
          </div>
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
