import React, { Component } from 'react';
import { Player } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from '../../ui/field/TextField';
import CheckField from '../../ui/field/CheckField';
import './Pad.css';

class Autoplayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pagingEnabled: false,
      scrollEnabled: true,
      directionalLockEnabled: false,
      scrollToX: 0,
      scrollToY: 0,
    };
    this.playerRef = React.createRef();
  }
  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  renderContent() {
    const items = [];

    for (let slide = 0; slide < 5; slide++) {
      const style = {
        position: 'absolute',
        top: 0,
        left: slide * 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 700,
        height: 300,
        backgroundColor: slide % 2 ? '#defdff' : '#cbf1ff',
        color: '#75d3ec',
        fontSize: 24,
        textAlign: 'center',
      };

      items.push(
        <div key={slide} style={style}>
          slide {slide}
        </div>
      );
    }

    return items;
  }

  render() {
    // const {} = this.state;
    return (
      <Player
        ref={this.playerRef}
        width={700}
        height={300}
        contentWidth={700 * 5}
        contentHeight={300}
        direction="horizontal"
      >
        {this.renderContent()}
      </Player>
    );
  }
}

export default Autoplayer;
