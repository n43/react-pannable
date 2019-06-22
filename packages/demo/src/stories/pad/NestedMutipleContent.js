import React from 'react';
import { Pad, ListContent, GridContent } from 'react-pannable';
import SvgGithub from './SvgGithub';
import { getSize } from './sizeGetter';
import './Pad.css';
import './NestedMutipleContent.css';

export default class NestedMutipleContent extends React.Component {
  state = {
    spacing: 8,
    scrollToIndex: 0,
    size: getSize(),
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
    const { spacing, size } = this.state;
    const { width, height } = size;

    return (
      <div className="pad-main">
        <div className="pad-preview">
          <Pad
            className="pad-padele"
            width={width}
            height={height}
            directionalLockEnabled
          >
            <ListContent
              width={width}
              spacing={spacing}
              itemCount={3}
              renderItem={({ itemIndex, Item }) => {
                if (itemIndex === 0) {
                  return (
                    <Item hash="Title">
                      <div className="nestedListTitle">Header</div>
                    </Item>
                  );
                } else if (itemIndex === 1) {
                  return (
                    <GridContent
                      width={width}
                      itemWidth={width / 2 - 5}
                      itemHeight={80}
                      itemCount={40}
                      rowSpacing={10}
                      renderItem={({ itemIndex }) => {
                        return (
                          <div className="nestedGridItem">
                            <SvgGithub width={35} height={35} />
                            <div className="nestedGridItemR">
                              <div className="nestedGridItemName">
                                UserName{itemIndex}
                              </div>
                              <div className="nestedGridItemBtn">Follow</div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  );
                } else {
                  return (
                    <Item hash="Title">
                      <div className="nestedListTitle">Footer</div>
                    </Item>
                  );
                }
              }}
            />
          </Pad>
        </div>
      </div>
    );
  }
}
