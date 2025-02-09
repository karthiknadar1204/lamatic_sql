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