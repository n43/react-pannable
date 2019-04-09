import React from 'react';
import resizeDetector from './utils/resizeDetector';
import ItemContent from './ItemContent';

export default class GeneralContent extends React.Component {
  static defaultProps = { ...ItemContent.defaultProps };

  constructor(props) {
    super(props);

    this.elemRef = React.createRef();
  }

  componentWillUnmount() {
    this._detachResizeNode();
  }

  getSize() {
    return this.elemRef.current.getSize();
  }

  calculateSize() {
    return this.elemRef.current.calculateSize();
  }

  _attachResizeNode() {
    const resizeNode = this.elemRef.current.resizeRef.current;

    if (!resizeNode || this._resizeNode) {
      return false;
    }

    this._resizeNode = resizeNode;
    resizeDetector.listenTo(resizeNode, () => this.calculateSize());

    return true;
  }

  _detachResizeNode() {
    if (!this._resizeNode) {
      return false;
    }

    resizeDetector.uninstall(this._resizeNode);
    this._resizeNode = undefined;

    return true;
  }

  _shouldCalculateSize = () => {
    const { width, height, shouldCalculateSize } = this.props;

    if (typeof width === 'number' && typeof height === 'number') {
      this._detachResizeNode();
    } else {
      if (this._attachResizeNode()) {
        return false;
      }
    }

    return shouldCalculateSize();
  };

  render() {
    return (
      <ItemContent
        ref={this.elemRef}
        {...this.props}
        shouldCalculateSize={this._shouldCalculateSize}
      />
    );
  }
}
