import React, { Component } from 'react';
import { Pad } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from './TextField';
import './Pad.css';

class BasicScroll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pagingEnabled: false,
      scrollEnabled: true,
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
        };

        items.push(<div key={row + '-' + column} style={style} />);
      }
    }

    return items;
  }

  render() {
    const { scrollEnabled, pagingEnabled, scrollToX, scrollToY } = this.state;
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
            <div className="pad-optcheck">
              <label>
                <input
                  type="checkbox"
                  checked={pagingEnabled}
                  onChange={this.handlePagingEnabledChange}
                />{' '}
                pagingEnabled
              </label>
            </div>
            <div className="pad-optcheck">
              <label>
                <input
                  type="checkbox"
                  checked={scrollEnabled}
                  onChange={this.handleScrollEnabledChange}
                />{' '}
                scrollEnabled
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicScroll;
