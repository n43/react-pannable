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

  _buildLoopContent() {
    const { direction, children } = this.props;
    const pad = this.playerRef.current.padRef.current;

    const contentSize = pad.getContentSize();
    const visibleRect = pad.getVisibleRect();

    const playerContentSize = {
      width: direction === 'x' ? contentSize.width * 2 : contentSize.width,
      height: direction === 'x' ? contentSize.height : contentSize.height * 2,
    };

    const wrapperStyle = {
      display: 'flex',
      width: playerContentSize.width,
      height: playerContentSize.height,
    };
    const contentStyle = {
      position: 'relative',
      width: contentSize.width,
      height: contentSize.height,
    };

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
            renderItem={() => {
              return (
                <div
                  key="loopElem"
                  style={{
                    width: contentSize.width,
                    height: contentSize.height,
                  }}
                >
                  {children}
                </div>
              );
            }}
            visibleRect={visibleRect}
            onResize={() => pad.setContentSize(playerContentSize)}
          />
        </div>
      </div>
    );
  }

  render() {
    const { loop, children, ...playerProps } = this.props;
    const { playerExisted } = this.state;
    let renderChildren = children;

    if (loop && playerExisted) {
      renderChildren = this._buildLoopContent();
    }

    return (
      <Player ref={this.playerRef} {...playerProps}>
        {renderChildren}
      </Player>
    );
  }
}
