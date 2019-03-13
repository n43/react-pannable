import React from 'react';
import Pad from './Pad';
import GridContent from './GridContent';

export default class Carousel extends React.Component {
  static defaultProps = {
    direction: 'vertical',
    loop: false,
    width: 0,
    height: 0,
    itemWidth: 0,
    itemHeight: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      slides: props.children
        ? props.children.map(element => React.cloneElement(element))
        : null,
      activeIndex: 0,
    };

    this.padRef = React.createRef();
    this.gridRef = React.createRef();
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  componentWillUnmount() {}

  _calculateActiveRect = ({ contentOffset }) => {
    console.log(contentOffset);
  };

  render() {
    const { direction, width, height, itemWidth, itemHeight } = this.props;
    const { slides } = this.state;

    if (!slides) {
      return null;
    }

    return (
      <Pad
        ref={this.padRef}
        width={width}
        height={height}
        pagingEnabled={true}
        onScroll={this._calculateActiveRect}
      >
        {pad => {
          const cOffset = pad.getContentOffset();
          const size = pad.getSize();
          const gridItemSize = {
            width: direction === 'horizontal' ? itemWidth : width,
            height: direction === 'horizontal' ? height : itemHeight,
          };

          return (
            <GridContent
              ref={this.gridRef}
              direction={direction}
              width={width}
              height={height}
              itemWidth={gridItemSize.width}
              itemHeight={gridItemSize.height}
              itemCount={slides.length}
              renderItem={({ itemIndex }) => slides[itemIndex]}
              visibleRect={{
                x: -cOffset.x,
                y: -cOffset.y,
                width: size.width,
                height: size.height,
              }}
              onResize={size => pad.setContentSize(size)}
            />
          );
        }}
      </Pad>
    );
  }
}
