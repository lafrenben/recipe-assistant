/**
 * @typedef {Object} FormattedMessage
 * @property {'user' | 'assistant'} role
 * @property {string} content
 * @property {string} [type]
 */

/**
 * Formats message objects into a consistent structure (because the 
 * message structure from the backend is in a bit of an ugly format)
 * 
 * @param {Object} message - The message object to format
 * @returns {FormattedMessage|null} The formatted message or null if invalid
 */
export function formatMessage(message) {
  try {
    if (typeof message !== 'object' || message === null) {
      return null;
    }

    const { role, content } = message;

    console.log("Formatting:");
    console.log(message);

    if (role === 'user') {
      return { role, content };
    }

    if (role === 'assistant') {
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing assistant message content:', error);
        return null;
      }

      if (parsedContent.type === 'ConversationalResponse') {
        return {
          role,
          content: parsedContent.response.response,
          type: 'conversation'
        };
      } else if (parsedContent.type === 'RecipeResponse') {
        // We're not rendering RecipeResponse messages in the chat,
        // but we'll include the type in case we need it later
        return {
          role,
          content: parsedContent.response.response,
          type: 'recipe'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error formatting message:', error);
    return null;
  }
}
