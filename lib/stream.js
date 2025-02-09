export async function streamUI({ messages, action, tools, connectionId }) {
  let response;

  switch (action.next) {
    case 'inquire':
      response = await tools.inquire(messages);
      break;
      
    case 'visualize':
    case 'analyze':
      response = await tools.researcher(messages);
      break;
      
    default:
      throw new Error('Unknown action type');
  }

  return response;
} 