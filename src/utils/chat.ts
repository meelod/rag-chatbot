//This file manages conversation IDs for the chat session. It does the following:
//1. Generates a unique conversation ID when a new chat session starts
//2. Retrieves the conversation ID from session storage or generates a new one if it doesn't exist
//3. Returns the conversation ID for use in API requests

const SESSION_STORAGE_CONVERSATION_ID_KEY = "conversationId";

export const generateConversationId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getConversationId = (): string => {
  let id = sessionStorage.getItem(SESSION_STORAGE_CONVERSATION_ID_KEY);
  if (!id) {
    id = generateConversationId();
    sessionStorage.setItem(SESSION_STORAGE_CONVERSATION_ID_KEY, id);
  }
  return id;
};
