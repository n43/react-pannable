import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from '../../ui/field/TextField';
import CheckField from '../../ui/field/CheckField';
import './Pad.css';

class BasicScroll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pagingEnabled: false,
      scrollEnabled: true,
      directionalLockEnabled: false,
      scrollToX: 0,
      scrollToY: 0,
    };
    this.padRef = React.createRef();
  }
  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };
  handlePagingEnabledChange = () => {
    this.setState(({ pagingEnabled }) => ({ pagingEnabled: !pagingEnabled }));
  };
  handleScrollEnabledChange = () => {
    this.setState(({ scrollEnabled }) => ({ scrollEnabled: !scrollEnabled }));
  };
  handleDirectionalLockEnabledChange = () => {
    this.setState(({ directionalLockEnabled }) => ({
      directionalLockEnabled: !directionalLockEnabled,
    }));
  };
  handleScrollToPos = () => {
    const { scrollToX, scrollToY } = this.state;

    if (
      scrollToX !== '' &&
      scrollToY !== '' &&
      !isNaN(parseInt(scrollToX)) &&
      !isNaN(parseInt(scrollToY))
    ) {
      this.padRef.current.scrollTo({
        offset: { x: parseInt(scrollToX), y: parseInt(scrollToY) },
        animated: true,
      });
    }
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
    const {
      scrollEnabled,
      pagingEnabled,
      directionalLockEnabled,
      scrollToX,
      scrollToY,
    } = this.state;
    return (
      <div className="pad-main">
        <div className="pad-preview">
          <SvgPhone className="pad-preview-bg" />
          <div className="pad-preview-content">
            <Pad
              ref={this.padRef}
              width={346}
              height={552}
              contentWidth={346 * 5}
              contentHeight={552 * 5}
              pagingEnabled={pagingEnabled}
              scrollEnabled={scrollEnabled}
              directionalLockEnabled={directionalLockEnabled}
            >
              {this.renderContent()}
            </Pad>
          </div>
        </div>
        <div className="pad-optbar">
          <TextField
            name="scrollToX"
            value={scrollToX}
            placeholder="integer"
            onChange={this.handleInputChange}
          />
          <TextField
            name="scrollToY"
            value={scrollToY}
            placeholder="integer"
            onChange={this.handleInputChange}
          />
          <div className="pad-btn" onClick={this.handleScrollToPos}>
            scroll
          </div>
          <div style={{ marginTop: '10px' }}>
            <CheckField
              name="pagingEnabled"
              checked={pagingEnabled}
              onChange={this.handlePagingEnabledChange}
            />
            <CheckField
              name="scrollEnabled"
              checked={scrollEnabled}
              onChange={this.handleScrollEnabledChange}
            />
            <CheckField
              name="directionalLockEnabled"
              checked={directionalLockEnabled}
              onChange={this.handleDirectionalLockEnabledChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default BasicScroll;
