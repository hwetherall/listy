// Handle environment variables in a centralized way
import env from './customEnv';

// Function to get API key
export const getOpenRouterApiKey = () => {
  const apiKey = env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenRouter API key not found in environment variables');
    return null;
  }
  
  return apiKey;
};

// Export other environment variables as needed
export const getBaseUrl = () => {
  return env.OPENROUTER_BASE_URL;
}; 