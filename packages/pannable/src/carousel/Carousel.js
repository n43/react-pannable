import React from 'react';
import StyleSheet from '../utils/StyleSheet';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    loop: true,
  };

  constructor(props) {
    super(props);

    this.playerRef = React.createRef();
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {}

  slideTo(index) {}

  slidePrev() {}

  slideNext() {}

  _buildLoopContent() {
    const player = this.playerRef && this.playerRef.current;
    console.log(2342423432, player);
    if (!player) {
      return null;
    }

    const { direction } = this.props;
    const pad = player.padRef.current;
    const size = pad.getSize();
    const contentSize = pad.getContentSize();
    const cOffset = pad.getContentOffset();

    const wrapperStyle = StyleSheet.create({
      display: 'flex',
    });
    const contentStyle = StyleSheet.create({
      position: 'relative',
      width: contentSize.width,
      height: contentSize.height,
    });

    return (
      <div style={wrapperStyle}>
        <div style={contentStyle}>{children}</div>
        <div style={contentStyle}>
          <ListContent
            direction={direction}
            height={contentSize.height}
            estimatedItemWidth={contentSize.width}
            estimatedItemHeight={contentSize.height}
            itemCount={1}
            renderItem={({ itemIndex, Item }) => {
              return <Item hash={'' + itemIndex}>{children}</Item>;
            }}
            visibleRect={{
              x: -cOffset.x,
              y: -cOffset.y,
              width: size.width,
              height: size.height,
            }}
            onResize={size => pad.setContentSize(size)}
          />
        </div>
      </div>
    );
  }

  render() {
    const { loop, children, ...playerProps } = this.props;
    const { direction, contentWidth, contentHeight } = playerProps;
    let renderChildren = children;
    let playerContentWidth = contentWidth;
    let playerContentHeight = contentHeight;

    if (loop) {
      const loopContent = this._buildLoopContent();

      if (loopContent) {
        renderChildren = loopContent;
        console.log(424423242);
        if (direction === 'x') {
          playerContentWidth = contentWidth * 2;
        } else {
          playerContentHeight = contentHeight * 2;
        }
      }
    }

    return (
      <Player
        ref={this.playerRef}
        {...playerProps}
        contentWidth={playerContentWidth}
        contentHeight={playerContentHeight}
      >
        {renderChildren}
      </Player>
    );
  }
}
