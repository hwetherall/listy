// A simple environment variable handler for the browser
// that doesn't rely on Node.js modules

// In Create React App, environment variables are injected at build time
// All environment variables need to be prefixed with REACT_APP_

// Debug environment variable loading
console.log('Environment variables loaded?', process.env.REACT_APP_OPENROUTER_API_KEY ? 'YES' : 'NO');
console.log('API key from .env (first 10 chars):', 
  process.env.REACT_APP_OPENROUTER_API_KEY ? 
  process.env.REACT_APP_OPENROUTER_API_KEY.substring(0, 10) + '...' : 
  'Not found'
);

// Use the API key from .env only, no hardcoded fallback
const env = {
  // OpenRouter API key from environment variable
  OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY || '',
  
  // Base URL for OpenRouter API
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1/chat/completions'
};

// Debug which key we're using
if (env.OPENROUTER_API_KEY) {
  console.log('Using API key (first 10 chars):', env.OPENROUTER_API_KEY.substring(0, 10) + '...');
} else {
  console.error('WARNING: No OpenRouter API key found! Please set REACT_APP_OPENROUTER_API_KEY in your environment.');
}

export default env; 