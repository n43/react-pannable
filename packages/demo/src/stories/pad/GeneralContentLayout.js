import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';
import './GeneralContentLayout.css';

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
    contentFixedWidth: 400,
    contentFixedHeight: '',
    imagesCount: '4',
    imageWidth: 400,
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
        <div className="autoadjust-optbar">
          {this.renderOptItem(
            'contentFixedWidth',
            contentFixedWidth,
            'integer',
            false
          )}
          {this.renderOptItem(
            'contentFixedHeight',
            contentFixedHeight,
            'integer',
            false
          )}
          {this.renderOptItem('imagesCount', imagesCount, '1-8', false)}
          {this.renderOptItem(
            'imageWidth',
            imageWidth,
            'auto or integer',
            false
          )}
        </div>
        <div className="autoadjust-main">
          <GeneralContent
            content={this.renderImages()}
            {...generalContentProps}
          >
            {({ content, contentWidth, contentHeight }) => (
              <Pad
                className="autoadjust-pad"
                width={400}
                height={600}
                contentWidth={contentWidth}
                contentHeight={contentHeight}
              >
                {content}
              </Pad>
            )}
          </GeneralContent>
        </div>
      </React.Fragment>
    );
  }
}

export default GeneralContentLayout;
