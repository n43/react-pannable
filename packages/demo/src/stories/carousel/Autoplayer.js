import React, { Component } from 'react';
import { Player } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import RadioField from '../../ui/field/RadioField';
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
          contentWidth={direction === 'x' ? 750 * 5 : 750}
          contentHeight={direction === 'x' ? 300 : 300 * 5}
          direction={direction}
        >
          {this.renderContent()}
        </Player>
        <div className="carousel-optbar">
          <div className="carsousel-status">autoplay is {statusText} now </div>
          <div className="carousel-btn" onClick={this.handleStart}>
            Start
          </div>
          <div className="carousel-btn" onClick={this.handleStop}>
            Stop
          </div>
        </div>
      </div>
    );
  }
}

export default Autoplayer;
