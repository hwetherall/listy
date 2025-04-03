// Debug utility to test environment variables
console.log('DEBUG: Environment variables check');
console.log('REACT_APP_OPENROUTER_API_KEY exists:', process.env.REACT_APP_OPENROUTER_API_KEY ? 'YES' : 'NO');
console.log('First few characters of API key:', process.env.REACT_APP_OPENROUTER_API_KEY ? process.env.REACT_APP_OPENROUTER_API_KEY.substring(0, 10) + '...' : 'N/A');

// Export a debug function to be used in components
export const debugEnvVars = () => {
  console.log('DEBUG from function: REACT_APP_OPENROUTER_API_KEY exists:', process.env.REACT_APP_OPENROUTER_API_KEY ? 'YES' : 'NO');
  return process.env.REACT_APP_OPENROUTER_API_KEY ? true : false;
}; 