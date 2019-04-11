import React, { Component } from 'react';
import { Pad, GeneralContent } from 'react-pannable';
import TextField from '../../ui/field/TextField';
import SvgGithub from './SvgGithub';
import './Pad.css';
import './GeneralContentLayout.css';

class GeneralContentLayout extends Component {
  state = {
    messageList: [
      'react-pannable will be better!',
      'Coding makes me happy~ 😄',
      'GitHub brings teams together to work through problems, move ideas forward, and learn from each other along the way.',
      'GitHub is home to the world’s largest community of developers and their projects',
      'Join the millions of developers already using GitHub to share their code, work together, and build amazing things.',
    ],
    message: '',
  };

  handleInputChange = evt => {
    const node = evt.target;

    this.setState({
      [node.name]: node.value,
    });
  };

  handleSendMessage = () => {
    const { message } = this.state;

    if (!message) {
      alert('Please input some text');
      return;
    }

    this.setState(state => {
      const { messageList, message } = state;
      const list = [...messageList];
      list.unshift(message);

      return {
        messageList: list,
        message: '',
      };
    });
  };

  renderMessage() {
    const { messageList } = this.state;

    return messageList.map((message, index) => {
      return (
        <div className="pad-message-item" key={index}>
          <div className="pad-message-hd">
            <SvgGithub />
            <div className="pad-message-username">UserName</div>
          </div>
          <div className="pad-message-content">{message}</div>
        </div>
      );
    });
  }

  renderArticle() {
    const boxStyle = {
      padding: 10,
      backgroundColor: '#ffffff',
      lineHeight: '1.5em',
    };
    const praStyle = {
      paddingTop: 10,
      paddingBottom: 10,
    };
    return (
      <div style={boxStyle}>
        <div style={{ ...praStyle, color: '#e47777' }}>
          GeneralContent is a quite useful component, when the size of content
          is difficult to figure out, or it would change dynamically.
        </div>
        <div style={{ ...praStyle, color: '#4a4a4a' }}>
          Just try to write some message to expand the content.
        </div>
      </div>
    );
  }

  render() {
    const { message } = this.state;

    return (
      <React.Fragment>
        <div className="pad-main">
          <div className="pad-preview">
            <Pad
              className="pad-padele"
              width={375}
              height={650}
              alwaysBounceX={false}
            >
              <GeneralContent width={375}>
                {this.renderArticle()}
                {this.renderMessage()}
              </GeneralContent>
            </Pad>
          </div>
          <div className="pad-optbar">
            <TextField
              name="message"
              value={message}
              placeholder="your message"
              onChange={this.handleInputChange}
            />
            <div className="pad-btn" onClick={this.handleSendMessage}>
              insert
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default GeneralContentLayout;
