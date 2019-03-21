import React from 'react';
import Player from './Player';
import ListContent from '../ListContent';

export default class Carousel extends React.PureComponent {
  static defaultProps = {
    direction: 'y',
    loop: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      playerExisted: false,
    };
    this.playerRef = React.createRef();
  }

  componentDidMount() {
    if (this.playerRef) {
      this.setState({ playerExisted: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {}

  slideTo(index) {}

  slidePrev() {}

  slideNext() {}

  _onPlayerFrameChange = activeIndex => {
    const { loop } = this.props;
    const player = this.playerRef.current;
    const pageCount = player.pageCount;

    // if(loop){
    //   if(activeIndex+1 > pageCount/2){
    //     player.setFrame()
    //   }
    // }
  };

  render() {
    const { loop, children, ...playerProps } = this.props;

    return (
      <Player ref={this.playerRef} {...playerProps}>
        {player => {
          if (loop) {
            const pad = player.padRef.current;
            const { direction } = playerProps;

            let padContentSize = {
              width:
                direction === 'x'
                  ? playerProps.contentWidth * 2
                  : playerProps.contentWidth,
              height:
                direction === 'x'
                  ? playerProps.contentHeight
                  : playerProps.contentHeight * 2,
            };
            let padVisibleRect = { x: 0, y: 0, width: 0, height: 0 };

            if (pad) {
              padContentSize = pad.getContentSize();
              padVisibleRect = pad.getVisibleRect();
            }

            return (
              <ListContent
                direction={direction}
                height={padContentSize.height}
                estimatedItemWidth={padContentSize.width / 2}
                estimatedItemHeight={contentSize.height / 2}
                itemCount={2}
                renderItem={() => {
                  return (
                    <div
                      style={{
                        position: 'relative',
                        width: contentSize.width,
                        height: contentSize.height,
                      }}
                    >
                      {children}
                    </div>
                  );
                }}
                visibleRect={padVisibleRect}
                onResize={size => pad.setContentSize(size)}
              />
            );
          }

          return children;
        }}
      </Player>
    );
  }
}
