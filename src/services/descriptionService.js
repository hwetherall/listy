// Import the custom environment variables
import env from '../utils/customEnv';

// Get API key and base URL from the custom env utility
const API_KEY = env.OPENROUTER_API_KEY;
const BASE_URL = env.OPENROUTER_BASE_URL;

/**
 * Generate company description using OpenAI's GPT-4o model
 */
export const generateCompanyDescription = async (companyName) => {
  try {
    const prompt = `Generate a concise 2-3 sentence description for the company "${companyName}". 
    Focus on what the company does, its target market, and any notable features or services. 
    Keep it factual and professional, similar to this example:
    
    "Neuron Mobility is a Singapore-based company founded in 2016 that operates a shared e-scooter and e-bike rental service, focusing on safe, sustainable, and convenient urban transportation. They design and manufacture their own commercial-grade vehicles, equipped with advanced safety features like app-controlled helmet locks and geofencing technology, and partner with cities across Australia, New Zealand, the UK, and Canada to reduce congestion and emissions."
    
    Return only the description with no additional text.`;
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Listy App'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-search-preview', // Use GPT-4o
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error generating description: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response structure from model: Missing expected content.');
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Description generation error:', error);
    throw error;
  }
};