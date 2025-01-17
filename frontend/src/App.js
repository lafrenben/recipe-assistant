import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from './components/Navbar';
import RecipeInput from './components/RecipeInput';
import RecipeDisplay from './components/RecipeDisplay';
import SettingsModal from './components/SettingsModal';
import ChatPanel from './components/ChatPanel';
import { parse } from 'partial-json'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/globals.css'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

function App() {
  const [recipe, setRecipe] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userInterfaceActions, setUserInterfaceActions] = useState([
    {
      'type': 'button',
      'label': '0.5x',
      'request': "Modify the ingredients and instructions to halve the original recipe. Keep any annotations previously provided, modifying them appropriately."
    },
    {
      'type': 'button',
      'label': '1x',
      'request': "Show me the recipe at 1x (not doubled or halved). Keep any annotations previously provided, modifying them appropriately."
    },
    {
      'type': 'button',
      'label': '2x',
      'request': "Modify the ingredients and instructions to double the original recipe. Keep any annotations previously provided, modifying them appropriately."
    },
    {
      'type': 'button',
      'label': 'No dairy',
      'request': "Annotate the recipe with substitutions for ingredients that contain dairy."
    },
  ]);
  const [standardAnnotations, setStandardAnnotations] = useState(
    "- Annotate ingredients in US fluid oz (fl oz, ounces) with their mL equivalent (e.g., for '8-oz can tomato sauce', annotate '8-oz = 236.59 mL'). Don't annotate measures in 'cups' in this way.\n" +
    "- Annotate ingredients in pounds (lbs) with kg equivalents (e.g., for '2 lb ground beef', annotate '2 lb = 0.907 kg')\n" +
    "- Annotate instructions with a succinct list of the ingredients referenced in that instruction, including the amounts, e.g. '1 tsp chili powder, 1 tsp salt'.\n"
  );
  // const [standardAnnotations, setStandardAnnotations] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  const handleRecipeSubmit = (url) => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/recipe`, {
          method: "post",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            annotations: standardAnnotations
          }),
        });
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

  const sendMessageToAssistant = async (message, threadId, setMessages, setRecipe, setThreadId, setIsLoading) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/${threadId}`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        }),
      });
  
      if (!response.ok) {
        throw new Error('Server response was not ok');
      }
  
      const decoder = new TextDecoderStream();
      const reader = response.body.pipeThrough(decoder).getReader();
      let acc = "";
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
              setRecipe(response_json[1].response);
            }
            if (response_json[1].type === 'ConversationalResponse') {
              setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                  role: 'assistant',
                  content: JSON.stringify(response_json[1])
                };
                return updatedMessages;
              });
            }
          }
        }
      }
      setThreadId(response_json[0].thread_id);
  
    } catch (error) {
      console.error('Error fetching recipe:', error);
    }
    setIsLoading(false);
  };  

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, { role: 'user', content: newMessage }];
        return updatedMessages;
      });

      sendMessageToAssistant(newMessage, threadId, setMessages, setRecipe, setThreadId, setIsLoading);

      // Clear the message input field
      setNewMessage('');
    }
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleUserInterfaceAction = (label, request) => {
    sendMessageToAssistant(request, threadId, setMessages, setRecipe, setThreadId, setIsLoading);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleStandardAnnotationsChange = (e) => {
    setStandardAnnotations(e.target.value);
  };

  return (
    <div className="app-container">
      <Navbar 
        onToggleChat={() => setShowChat(!showChat)}
        isLoading={isLoading}
        onOpenSettings={handleOpenSettings}
      />
      <div className="content-wrapper">
        <Container fluid className="main-content">
          <Row>
            <Col>
              <RecipeInput onSubmit={handleRecipeSubmit} isLoading={isLoading} />
              {recipe && <RecipeDisplay recipe={recipe} userInterfaceActions={userInterfaceActions} onUserInterfaceAction={handleUserInterfaceAction} />}
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
      <SettingsModal
        show={showSettings}
        onHide={handleCloseSettings}
        standardAnnotations={standardAnnotations}
        onStandardAnnotationsChange={handleStandardAnnotationsChange}
      />
    </div>
  );
}

export default App;
