import React, { useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { formatMessage } from '../utils/messageFormatting';
import Markdown from 'react-markdown'

export default function ChatPanel({ isOpen, messages, newMessage, onSendMessage, onNewMessageChange }) {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(e);
    }
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-messages">
        <div className="messages-container">
          <p className="chat-instructional-text">
            You can ask questions about the recipe or general cooking inquiries.
          </p>
          {messages.map((message, index) => {
            const formattedMessage = formatMessage(message);
            if (!formattedMessage || formattedMessage.type === 'recipe') {
              return null;
            }
            return (
              <div key={index} className={`message ${formattedMessage.role}`}>
                <Markdown>{formattedMessage.content}</Markdown>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <Form onSubmit={onSendMessage} className="chat-input">
        <Form.Group className="flex-grow-1">
          <Form.Control
            as="textarea"
            rows={3}
            value={newMessage}
            onChange={onNewMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            ref={textareaRef}
          />
        </Form.Group>
        <Button type="submit" variant="primary">Send</Button>
      </Form>
    </div>
  );
}
