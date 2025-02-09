import { createContext, useContext } from 'react';

export const AIStateContext = createContext(null);

export const initialAIState = [];
export const initialUIState = [];

export function useAIState() {
  const context = useContext(AIStateContext);
  if (!context) {
    throw new Error('useAIState must be used within an AIStateProvider');
  }
  return context;
}

export function getMutableAIState() {
  let currentState = [];
  
  return {
    get: () => currentState,
    update: (newState) => {
      currentState = newState;
    },
    done: (finalState) => {
      currentState = finalState;
    }
  };
} 