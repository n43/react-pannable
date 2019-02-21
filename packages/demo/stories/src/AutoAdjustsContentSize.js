import React, { Component } from 'react';
import { Pad } from 'react-pannable';

class AutoAdjustsContentSize extends Component {
  render() {
    return (
      <Pad
        width={320}
        height={500}
        contentWidth={320}
        contentHeight={1300}
        autoAdjustsContentSize={true}
      >
        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras aliquam
          hendrerit elit id vulputate. Pellentesque pellentesque erat rutrum
          velit facilisis sodales convallis tellus lacinia. Curabitur gravida mi
          sit amet nulla suscipit sed congue dolor volutpat. Aenean sem tortor,
          pretium et euismod in, imperdiet sit amet urna. Ut ante nisi, auctor
          mattis suscipit a, ullamcorper eget leo. Phasellus sagittis ante at
          lectus rutrum ut sollicitudin sem malesuada. Duis ultrices sapien et
          nulla tincidunt malesuada. Mauris ante turpis, dignissim eu tincidunt
          vitae, placerat quis diam. In augue nisl, cursus at rutrum ut,
          scelerisque et erat. Suspendisse potenti. Pellentesque habitant morbi
          tristique senectus et netus et malesuada fames ac turpis egestas.
          Mauris orci dui, aliquam ut convallis ut, dapibus et erat. Cum sociis
          natoque penatibus et magnis dis parturient montes, nascetur ridiculus
          mus. Aliquam erat volutpat. Mauris placerat elit id lectus rhoncus in
          dignissim justo mollis. Donec nec odio sapien. In iaculis euismod
          felis non laoreet. Mauris ornare varius neque, et congue erat porta a.
          Aliquam nec auctor lectus. Etiam ut ipsum a nibh iaculis fringilla.
        </div>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras aliquam
          hendrerit elit id vulputate. Pellentesque pellentesque erat rutrum
          velit facilisis sodales convallis tellus lacinia. Curabitur gravida mi
          sit amet nulla suscipit sed congue dolor volutpat. Aenean sem tortor,
          pretium et euismod in, imperdiet sit amet urna. Ut ante nisi, auctor
          mattis suscipit a, ullamcorper eget leo. Phasellus sagittis ante at
          lectus rutrum ut sollicitudin sem malesuada. Duis ultrices sapien et
          nulla tincidunt malesuada. Mauris ante turpis, dignissim eu tincidunt
          vitae, placerat quis diam. In augue nisl, cursus at rutrum ut,
          scelerisque et erat. Suspendisse potenti. Pellentesque habitant morbi
          tristique senectus et netus et malesuada fames ac turpis egestas.
          Mauris orci dui, aliquam ut convallis ut, dapibus et erat. Cum sociis
          natoque penatibus et magnis dis parturient montes, nascetur ridiculus
          mus. Aliquam erat volutpat. Mauris placerat elit id lectus rhoncus in
          dignissim justo mollis. Donec nec odio sapien. In iaculis euismod
          felis non laoreet. Mauris ornare varius neque, et congue erat porta a.
          Aliquam nec auctor lectus. Etiam ut ipsum a nibh iaculis fringilla.
        </div>
      </Pad>
    );
  }
}

export default AutoAdjustsContentSize;
