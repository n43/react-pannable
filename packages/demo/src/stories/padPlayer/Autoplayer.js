import React, { Component } from 'react';
import { PadPlayer } from 'react-pannable';
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

    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        const style = {
          position: 'absolute',
          top: row * 552,
          left: column * 346,
          width: 346,
          height: 552,
          backgroundColor: (row + column) % 2 ? '#defdff' : '#cbf1ff',
          color: '#75d3ec',
          fontSize: 24,
          lineHeight: '552px',
          textAlign: 'center',
        };

        items.push(
          <div key={row + '-' + column} style={style}>
            row:{row + 1} column:{column + 1}
          </div>
        );
      }
    }

    return items;
  }

  render() {
    // const {} = this.state;
    return (
      <div className="pad-main">
        <div className="pad-preview">
          <SvgPhone className="pad-preview-bg" />
          <div className="pad-preview-content">
            <PadPlayer
              ref={this.playerRef}
              width={346}
              height={552}
              contentWidth={346 * 5}
              contentHeight={552 * 5}
            >
              {this.renderContent()}
            </PadPlayer>
          </div>
        </div>
        <div className="pad-optbar" />
      </div>
    );
  }
}

export default Autoplayer;
