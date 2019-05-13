import React from 'react';
import ItemContent from './ItemContent';
import resizeDetector from './utils/resizeDetector';

export default class GeneralContent extends React.Component {
  static defaultProps = { ...ItemContent.defaultProps };

  elemRef = React.createRef();

  componentDidMount() {
    this._checkResizeNode();
  }

  componentDidUpdate(prevProps) {
    const { width, height } = this.props;

    if (width !== prevProps.width || height !== prevProps.height) {
      this._checkResizeNode();
    }
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

  _checkResizeNode() {
    const { width, height } = this.props;

    if (typeof width === 'number' && typeof height === 'number') {
      this._detachResizeNode();
    } else {
      this._attachResizeNode(this.elemRef.current.resizeRef.current);
    }
  }

  _attachResizeNode(resizeNode) {
    if (this._resizeNode) {
      return;
    }

    this._resizeNode = resizeNode;
    resizeDetector.listenTo(resizeNode, () => this.calculateSize());
  }

  _detachResizeNode() {
    if (!this._resizeNode) {
      return;
    }

    resizeDetector.uninstall(this._resizeNode);
    this._resizeNode = undefined;
  }

  render() {
    return <ItemContent ref={this.elemRef} {...this.props} />;
  }
}
