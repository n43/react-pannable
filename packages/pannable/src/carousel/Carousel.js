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

            const contentSize = pad
              ? pad.getContentSize()
              : {
                  width: playerProps.contentWidth,
                  height: playerProps.conte,
                };
            const visibleRect = pad
              ? pad.getVisibleRect()
              : {
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                };

            return (
              <ListContent
                direction={direction}
                height={contentSize.height}
                estimatedItemWidth={contentSize.width}
                estimatedItemHeight={contentSize.height}
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
                visibleRect={visibleRect}
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
