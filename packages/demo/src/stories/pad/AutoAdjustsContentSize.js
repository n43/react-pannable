import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';

class AutoAdjustsContentSize extends Component {
  state = {
    paragraph: [1, 2, 3],
    contentWidth: 400,
  };
  componentDidMount() {
    // setTimeout(() => {
    //   this.setState({ paragraph: [1, 2, 3, 4] });
    //   console.log('resize!!');
    // }, 10000);
  }
  renderContent = () => {
    const { paragraph } = this.state;

    return paragraph.map(item => {
      if (item < 4) {
        return (
          <div style={{ marginBottom: '20px', lineHeight: '1.8em' }} key={item}>
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
          <div style={{ marginBottom: '20px', lineHeight: '1.8em' }} key={item}>
            Content resize!Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Cras aliquam hendrerit elit id vulputate. Pellentesque
            pellentesque erat rutrum velit facilisis sodales convallis tellus
            lacinia.
          </div>
        );
      }
    });
  };
  render() {
    return (
      <div style={{ width: '400px', height: '600px' }}>
        <GeneralContent content={this.renderContent()} fixedWidth={400}>
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
