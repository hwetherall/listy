// Debug utilities for the Listy application

// Check if the API key is available in the environment
export const checkApiKey = () => {
  console.log('REACT_APP_OPENROUTER_API_KEY exists:', process.env.REACT_APP_OPENROUTER_API_KEY ? 'YES' : 'NO');
  
  if (process.env.REACT_APP_OPENROUTER_API_KEY) {
    console.log('First few characters of API key:', process.env.REACT_APP_OPENROUTER_API_KEY.substring(0, 10) + '...');
    return true;
  } else {
    console.error('DEBUG: No API key found in environment variables. Please set REACT_APP_OPENROUTER_API_KEY.');
    return false;
  }
};

// Test the OpenRouter API with a lightweight ping request
export const testApiKey = async () => {
  const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('DEBUG: Cannot test API key - no key found in environment variables.');
    return { success: false, message: 'No API key available' };
  }
  
  try {
    console.log('DEBUG: Testing OpenRouter API key...');
    
    // Make a lightweight request to verify API key is valid
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Listy App Key Test'
      }
    });
    
    if (response.ok) {
      console.log('DEBUG: API key is valid!');
      const data = await response.json();
      return { 
        success: true, 
        message: 'API key is valid',
        data 
      };
    } else {
      console.error('DEBUG: API key test failed with status:', response.status);
      const errorData = await response.json();
      return { 
        success: false, 
        message: `API key test failed: ${errorData.error?.message || response.statusText}`,
        status: response.status,
        errorData
      };
    }
  } catch (error) {
    console.error('DEBUG: Error testing API key:', error);
    return { 
      success: false, 
      message: `Error testing API key: ${error.message}` 
    };
  }
};

// Log a debug message with a function context
export const debugLog = (message, context = 'general') => {
  console.log(`DEBUG from ${context}: ${message}`);
};

// Export a function that runs the API key check
export default function performApiKeyCheck() {
  const result = checkApiKey();
  debugLog(`REACT_APP_OPENROUTER_API_KEY exists: ${result ? 'YES' : 'NO'}`, 'function');
  return result;
}

// Import and use this file in App.js or another component to see the output 