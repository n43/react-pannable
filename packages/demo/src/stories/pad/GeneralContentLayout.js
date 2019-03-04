import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from './TextField';
import './Pad.css';

const images = [
  'http://h1.ioliu.cn//bing/CumulusCaribbean_ZH-CN4884493707_1920x1080.jpg',
  'http://h1.ioliu.cn//bing/LoisachKochelsee_ZH-CN5859866695_1920x1080.jpg',
  'http://h1.ioliu.cn//bing/MinnewankaBoathouse_ZH-CN0548323518_1920x1080.jpg',
  'http://h1.ioliu.cn//bing/AthabascaCave_EN-AU0628983693_1920x1080.jpg',
  'http://h1.ioliu.cn//bing/SwissSuspension_EN-AU8560310773_1920x1080.jpg',
  'http://h1.ioliu.cn//bing/SpainSurfer_EN-AU11271138486_640x360.jpg',
  'http://h1.ioliu.cn//bing/AuburnBalloons_EN-AU8649124966_1920x1080.jpg',
  'http://h1.ioliu.cn//bing/PJ_EN-AU10859560585_1920x1080.jpg',
];

class GeneralContentLayout extends Component {
  state = {
    contentFixedWidth: 346,
    contentFixedHeight: -1,
    imagesCount: 5,
    imageWidth: 346,
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

  renderImages = () => {
    const { imagesCount, imageWidth } = this.state;
    const elements = [];

    for (let idx = 0; idx < Math.max(0, imagesCount); idx++) {
      const imgStyle = { display: 'block' };

      if (imageWidth > 0) {
        imgStyle.width = imageWidth;
      }

      elements.push(
        <img key={idx} src={images[idx % images.length]} style={imgStyle} />
      );
    }

    return <React.Fragment>{elements}</React.Fragment>;
  };

  render() {
    const {
      contentFixedWidth,
      contentFixedHeight,
      imagesCount,
      imageWidth,
    } = this.state;

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <GeneralContent
                content={this.renderImages()}
                width={contentFixedWidth}
                height={contentFixedHeight}
              >
                {({ content, size }) => (
                  <Pad
                    className="autoadjust-pad"
                    width={346}
                    height={552}
                    contentWidth={size.width}
                    contentHeight={size.height}
                  >
                    {content}
                  </Pad>
                )}
              </GeneralContent>
            </div>
          </div>
          <div className="pad-optbar">
            <TextField
              name="contentFixedWidth"
              defaultValue={contentFixedWidth}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="contentFixedHeight"
              defaultValue={contentFixedHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="imagesCount"
              defaultValue={imagesCount}
              placeholder="1-8"
              onChange={this.handleInputChange}
            />
            <TextField
              name="imageWidth"
              defaultValue={imageWidth}
              placeholder="auto or integer"
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default GeneralContentLayout;
