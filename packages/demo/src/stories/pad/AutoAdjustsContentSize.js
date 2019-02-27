import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';

class AutoAdjustsContentSize extends Component {
  state = {
    paragraph: [1, 2, 3],
    images: [
      'http://h1.ioliu.cn//bing/CumulusCaribbean_ZH-CN4884493707_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/LoisachKochelsee_ZH-CN5859866695_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/MinnewankaBoathouse_ZH-CN0548323518_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/AthabascaCave_EN-AU0628983693_1920x1080.jpg',
      'http://h1.ioliu.cn//bing/SwissSuspension_EN-AU8560310773_1920x1080.jpg',
    ],
    contentWidth: 400,
  };
  componentDidMount() {
    setTimeout(() => {
      this.setState({ paragraph: [1, 2, 3, 4] });
    }, 10000);
  }
  renderArticle = () => {
    const { paragraph } = this.state;

    return paragraph.map(item => {
      if (item < 4) {
        return (
          <div
            style={{ paddingBottom: '20px', lineHeight: '1.8em' }}
            key={item}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras
            aliquam hendrerit elit id vulputate. Pellentesque pellentesque erat
            rutrum velit facilisis sodales convallis tellus lacinia. Curabitur
            gravida mi sit amet nulla suscipit sed congue dolor volutpat. Aenean
            sem tortor, pretium et euismod in, imperdiet sit amet urna. Ut ante
            nisi, auctor mattis suscipit a, ullamcorper eget leo. Phasellus
            sagittis ante at lectus rutrum ut sollicitudin sem malesuada. Duis
            ultrices sapien et nulla tincidunt malesuada. Mauris ante turpis,
            dignissim eu tincidunt vitae, placerat quis diam. In augue nisl,
            cursus at rutrum ut, scelerisque et erat. Suspendisse potenti.
            Pellentesque habitant morbi tristique senectus et netus et malesuada
            fames ac turpis egestas. Mauris orci dui, aliquam ut convallis ut,
            dapibus et erat. Cum sociis natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Aliquam erat volutpat.
            Mauris placerat elit id lectus rhoncus in dignissim justo mollis.
            Donec nec odio sapien. In iaculis euismod felis non laoreet. Mauris
            ornare varius neque, et congue erat porta a. Aliquam nec auctor
            lectus. Etiam ut ipsum a nibh iaculis fringilla.
          </div>
        );
      } else {
        return (
          <div
            style={{ paddingBottom: '20px', lineHeight: '1.8em' }}
            key={item}
          >
            Content resize!Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Cras aliquam hendrerit elit id vulputate. Pellentesque
            pellentesque erat rutrum velit facilisis sodales convallis tellus
            lacinia.
          </div>
        );
      }
    });
  };
  renderImages = () => {
    const { images } = this.state;

    return images.map(src => (
      <img src={src} style={{ width: '400px' }} key={src} />
    ));
  };
  render() {
    return (
      <div style={{ width: '400px', height: '600px' }}>
        <GeneralContent content={this.renderImages()}>
          {({ content, contentWidth, contentHeight }) => (
            <Pad
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
    );
  }
}

export default AutoAdjustsContentSize;
