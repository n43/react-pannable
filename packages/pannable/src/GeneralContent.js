import React from 'react';
import ItemContent from './ItemContent';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = { ...ItemContent.defaultProps };

  static contextType = ItemContent.contextType;

  elemRef = React.createRef();

  componentWillUnmount() {
    this._detachResizeNode();
  }

  getSize() {
    return this.elemRef.current.getSize();
  }

  calculateSize() {
    return this.elemRef.current.calculateSize();
  }

  _attachResizeNode(resizeNode) {
    this._resizeNode = resizeNode;
    resizeDetector.listenTo(resizeNode, () => this.calculateSize());
  }

  _detachResizeNode() {
    if (this._resizeNode) {
      resizeDetector.uninstall(this._resizeNode);
      this._resizeNode = undefined;
    }
  }

  _onResize = (size, resizeRef) => {
    const { width, height } = this.props;

    if (typeof width === 'number' && typeof height === 'number') {
      this._detachResizeNode();
    } else {
      if (!this._resizeNode) {
        this._attachResizeNode(resizeRef.current);
      }
    }

    this.props.onResize(size, resizeRef);
  };

  render() {
    return (
      <ItemContent
        ref={this.elemRef}
        {...this.props}
        onResize={this._onResize}
      />
    );
  }
}
