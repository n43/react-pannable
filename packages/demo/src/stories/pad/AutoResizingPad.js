import React, { Component } from 'react';
import { Pad, AutoResizing } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from '../../ui/field/TextField';
import './Pad.css';
import './AutoResizingPad.css';

class AutoResizingPad extends Component {
  state = {
    headerHeight: 50,
    padWidth: -1,
    padHeight: -1,
  };

  handleInputChange = evt => {
    const node = evt.target;
    const value = parseInt(node.value, 10);
    if (isNaN(value)) {
      return;
    }

    this.setState({
      [node.name]: value,
    });
  };

  render() {
    const { headerHeight, padWidth, padHeight } = this.state;

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <div className="autoresize-wrapper">
                <div
                  className="autoresize-header"
                  style={{ height: headerHeight }}
                >
                  Header
                </div>
                <div className="autoresize-main">
                  <AutoResizing width={padWidth} height={padHeight}>
                    {({ width, height }) => (
                      <Pad
                        className="autoadjust-pad"
                        width={width}
                        height={height}
                        contentWidth={346}
                        contentHeight={810}
                        style={{ backgroundColor: '#f5f5f5' }}
                      >
                        <div className="autoresize-content">
                          <div
                            className="autosize-paragraph"
                            style={{ color: '#52a7ea' }}
                          >
                            AutoResizing would automatically fill its parent,
                            unless you specify the value of width or height
                          </div>
                          <div className="autosize-paragraph">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Cras aliquam hendrerit elit id vulputate.
                            Pellentesque pellentesque erat rutrum velit
                            facilisis sodales convallis tellus lacinia.
                            Curabitur gravida mi sit amet nulla suscipit sed
                            congue dolor volutpat. Aenean sem tortor, pretium et
                            euismod in, imperdiet sit amet urna. Ut ante nisi,
                            auctor mattis suscipit a, ullamcorper eget leo.
                            Phasellus sagittis ante at lectus rutrum ut
                            sollicitudin sem malesuada. Duis ultrices sapien et
                            nulla tincidunt malesuada. Mauris ante turpis,
                            dignissim eu tincidunt vitae, placerat quis diam. In
                            augue nisl, cursus at rutrum ut, scelerisque et
                            erat. Suspendisse potenti. Pellentesque habitant
                            morbi tristique senectus et netus et malesuada fames
                            ac turpis egestas. Mauris orci dui, aliquam ut
                            convallis ut, dapibus et erat. Cum sociis natoque
                            penatibus et magnis dis parturient montes, nascetur
                            ridiculus mus. Aliquam erat volutpat. Mauris
                            placerat elit id lectus rhoncus in dignissim justo
                            mollis. Donec nec odio sapien. In iaculis euismod
                            felis non laoreet. Mauris ornare varius neque, et
                            congue erat porta a. Aliquam nec auctor lectus.
                            Etiam ut ipsum a nibh iaculis fringilla.
                          </div>
                        </div>
                      </Pad>
                    )}
                  </AutoResizing>
                </div>
              </div>
            </div>
          </div>
          <div className="pad-optbar">
            <TextField
              name="headerHeight"
              defaultValue={headerHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="padWidth"
              defaultValue={padWidth}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="padHeight"
              defaultValue={padHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AutoResizingPad;
