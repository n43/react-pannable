import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';
import SvgPhone from './SvgPhone';
import TextField from './TextField';
import './Pad.css';

class GeneralContentLayout extends Component {
  state = {
    images: [
      'http://h1.ioliu.cn//bing/CumulusCaribbean_ZH-CN4884493707_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/LoisachKochelsee_ZH-CN5859866695_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/MinnewankaBoathouse_ZH-CN0548323518_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/AthabascaCave_EN-AU0628983693_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/SwissSuspension_EN-AU8560310773_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/SpainSurfer_EN-AU11271138486_640x360.jpg',
      'http://h1.ioliu.cn//bing/AuburnBalloons_EN-AU8649124966_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/PJ_EN-AU10859560585_1920x1080.jpg',
    ],
    contentFixedWidth: 346,
    contentFixedHeight: '',
    imagesCount: '5',
    imageWidth: 346,
  };

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  renderImages = () => {
    const { images, imagesCount, imageWidth } = this.state;

    return images.map((src, index) => {
      if (index + 1 > imagesCount) {
        return null;
      }

      let styleWidth = 'auto';
      if (!isNaN(parseInt(imageWidth))) {
        styleWidth = `${imageWidth}px`;
      }
      return (
        <img
          src={src}
          style={{ display: 'block', width: styleWidth }}
          key={src}
        />
      );
    });
  };
  renderOptItem(name, value, placeholder, isReadonly) {
    return (
      <div className="autoadjust-optitem">
        <div className="autoadjust-optlabel">{name}</div>
        {isReadonly ? (
          <div className="autoadjust-optinput">{value}</div>
        ) : (
          <input
            className="autoadjust-optinput"
            value={value}
            name={name}
            placeholder={placeholder}
            onChange={this.handleInputChange}
          />
        )}
      </div>
    );
  }
  render() {
    const {
      contentFixedWidth,
      contentFixedHeight,
      imagesCount,
      imageWidth,
    } = this.state;

    const generalContentProps = {};
    if (contentFixedWidth && !isNaN(parseInt(contentFixedWidth))) {
      generalContentProps.fixedWidth = parseInt(contentFixedWidth);
    }
    if (contentFixedHeight && !isNaN(parseInt(contentFixedHeight))) {
      generalContentProps.fixedHeight = parseInt(contentFixedHeight);
    }

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <SvgPhone className="pad-preview-bg" />
            <div className="pad-preview-content">
              <GeneralContent
                content={this.renderImages()}
                {...generalContentProps}
              >
                {({ content, width, height }) => (
                  <Pad
                    className="autoadjust-pad"
                    width={346}
                    height={552}
                    contentWidth={width}
                    contentHeight={height}
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
              value={contentFixedWidth}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="contentFixedHeight"
              value={contentFixedHeight}
              placeholder="integer"
              onChange={this.handleInputChange}
            />
            <TextField
              name="imagesCount"
              value={imagesCount}
              placeholder="1-8"
              onChange={this.handleInputChange}
            />
            <TextField
              name="imageWidth"
              value={imageWidth}
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
