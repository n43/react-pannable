import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';
import SvgPhone from './SvgPhone';
import SvgPlus from './SvgPlus';
import SvgMinus from './SvgMinus';
import TextField from '../../ui/field/TextField';
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
    contentFixedWidth: '346',
    contentFixedHeight: '',
    imagesCount: 5,
    imageWidth: '346',
  };

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  handleImageCountChange = type => {
    this.setState(({ imagesCount }) => {
      let count = imagesCount;
      if (type === 'add' && imagesCount < 8) {
        count += 1;
      }
      if (type === 'minus' && imagesCount > 1) {
        count -= 1;
      }
      return {
        imagesCount: count,
      };
    });
  };

  renderImages = () => {
    const { imagesCount, imageWidth } = this.state;
    const elements = [];

    for (let idx = 0; idx < Math.max(0, imagesCount); idx++) {
      const imgStyle = { display: 'block' };

      imgStyle.width = +imageWidth || 0;

      elements.push(
        <img key={idx} src={images[idx % images.length]} style={imgStyle} />
      );
    }

    return <React.Fragment>{elements}</React.Fragment>;
  };

  renderArticle = () => {
    const style = {
      padding: 10,
      lineHeight: '1.5em',
      color: '#e47777',
    };
    return (
      <div style={style}>
        GeneralContent is a quite useful component, when the size of content is
        difficult to figure out, or it would change dynamically.
      </div>
    );
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
              <Pad
                className="autoadjust-pad"
                width={346}
                height={552}
                alwaysBounceX={false}
              >
                {pad => (
                  <GeneralContent
                    width={contentFixedWidth ? +contentFixedWidth || 0 : null}
                    height={
                      contentFixedHeight ? +contentFixedHeight || 0 : null
                    }
                    onResize={size => pad.setContentSize(size)}
                  >
                    {this.renderArticle()}
                    {this.renderImages()}
                  </GeneralContent>
                )}
              </Pad>
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
              name="imageWidth"
              defaultValue={imageWidth}
              placeholder="auto or integer"
              onChange={this.handleInputChange}
            />
            <div className="pad-numberfield">
              <div className="pad-numberfield-label">imagesCount</div>
              <div className="pad-numberfield-main">
                <SvgMinus
                  onClick={() => this.handleImageCountChange('minus')}
                />
                <div className="pad-numberfield-text">{imagesCount}</div>
                <SvgPlus onClick={() => this.handleImageCountChange('add')} />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default GeneralContentLayout;
