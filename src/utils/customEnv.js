// A simple environment variable handler for the browser
// that doesn't rely on Node.js modules

// In Create React App, environment variables are injected at build time
// All environment variables need to be prefixed with REACT_APP_
const env = {
  // OpenRouter API key from environment variable
  OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY || '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',
  
  // Base URL for OpenRouter API
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1/chat/completions'
};

export default env; 