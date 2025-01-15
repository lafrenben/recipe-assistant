import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from './components/Navbar';
import RecipeInput from './components/RecipeInput';
import RecipeDisplay from './components/RecipeDisplay';
import ChatPanel from './components/ChatPanel';
import { parse } from 'partial-json'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/globals.css'

const BACKEND_URL = "http://localhost:4000"

function App() {
  const [recipe, setRecipe] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleRecipeSubmit = (url) => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/recipe?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Server response was not ok');
        }

        const decoder = new TextDecoderStream();
        const reader = response.body.pipeThrough(decoder).getReader();
        let acc = ""
        let response_json;

        while (true) {
          let { value, done } = await reader.read();
          if (done) break;
          acc += value;
          response_json = parse(acc);

          // If we've parsed enough of the JSON to start displaying the recipe...
          if (response_json && response_json.length > 1 && response_json[1].response) {
            // ... display what we have so far.
            setRecipe(response_json[1].response)
          }
        }
        // Entire JSON should be parsed by now -- get the thread_id
        setThreadId(response_json[0].thread_id);

      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
      setIsLoading(false);
    })();
  };


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, { role: 'user', content: newMessage }];
        return updatedMessages;
      });

      (async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${BACKEND_URL}/api/chat/${threadId}`, {
            method: "post",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: newMessage
            }),
          });

          if (!response.ok) {
            throw new Error('Server response was not ok');
          }
  
          const decoder = new TextDecoderStream();
          const reader = response.body.pipeThrough(decoder).getReader();
          let acc = ""
          let response_json;

          // Add a new blank message for the reply, which we will fill with the streamed content 
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, { role: 'assistant', content: '' }];
            return updatedMessages;
          });
              
          while (true) {
            let { value, done } = await reader.read();
            if (done) break;
            acc += value;
            response_json = parse(acc);
  
            // If we've parsed enough of the JSON to start displaying the recipe...
            if (response_json && response_json.length > 1) {
              if (response_json[1].type && response_json[1].response) {
                if (response_json[1].type === 'RecipeResponse') {
                  setRecipe(response_json[1].response)
                }
                if (response_json[1].type === 'ConversationalResponse') {

                  setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages]
                    updatedMessages[updatedMessages.length - 1] = {
                      role: 'assistant',
                      content: JSON.stringify(response_json[1])
                    }
                    return updatedMessages
                  });

                  // if (existing_partial_message) {
                  //   // Remove the old partial message
                  //   setMessages((prevMessages) => prevMessages.slice(0, -1));
                  // }
                  // // Add the partial message
                  // setMessages([...messages, { role: 'assistant', 'content': JSON.stringify(response_json[1].response) } ]);
                  // existing_partial_message = true;
                }
              }
            }
          }
          setThreadId(response_json[0].thread_id);
  
        } catch (error) {
          console.error('Error fetching recipe:', error);
        }
        setIsLoading(false);
      })();

      // Clear the message input field
      setNewMessage('');
    }
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    <div className="app-container">
      <Navbar onToggleChat={() => setShowChat(!showChat)} isLoading={isLoading} />
      <div className="content-wrapper">
        <Container fluid className="main-content">
          <Row>
            <Col>
              <RecipeInput onSubmit={handleRecipeSubmit} isLoading={isLoading} />
              {recipe && <RecipeDisplay recipe={recipe} />}
            </Col>
          </Row>
        </Container>
        <ChatPanel 
          isOpen={showChat} 
          messages={messages}
          newMessage={newMessage}
          onSendMessage={handleSendMessage}
          onNewMessageChange={handleNewMessageChange}
        />      
      </div>
    </div>
  );
}

export default App;
