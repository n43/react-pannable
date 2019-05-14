import React from 'react';
import PadContext from './PadContext';
import ItemContent from './ItemContent';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = { ...ItemContent.defaultProps };

  static contextType = PadContext;

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

  _onResize = size => {
    const { width, height } = this.props;

    if (typeof width === 'number' && typeof height === 'number') {
      this._detachResizeNode();
    } else {
      if (!this._resizeNode) {
        this._attachResizeNode(this.elemRef.current.resizeRef.current);
      }
    }

    this.context.onContentResize(size);
  };

  render() {
    return (
      <PadContext.Provider
        value={{ ...this.context, onContentResize: this._onResize }}
      >
        <ItemContent ref={this.elemRef} {...this.props} />
      </PadContext.Provider>
    );
  }
}
