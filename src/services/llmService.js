// List of LLM models to query
const LLM_MODELS = [
    'microsoft/mai-ds-r1:free',
    // 'google/gemini-2.5-pro-exp-03-25:free', // Removed due to consistent errors and duplicate provider
    'openai/gpt-4o-search-preview',
    'anthropic/claude-3.7-sonnet',
    'x-ai/grok-3-mini-beta',
    'cohere/command-r7b-12-2024',
    // 'qwen/qwq-32b:free', // Removed due to slowness
    'meta-llama/llama-4-scout',
    'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    'perplexity/sonar-pro',
    'google/gemma-3-27b-it'
  ];
  
  // Get API key from environment variables
  const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
  const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  /**
   * Generate prompt for list creation
   */
  const generateListPrompt = (input, longListCount) => {
    return `You are an expert at creating comprehensive and accurate lists. Your task is to generate a list of ${longListCount} items that are similar to or related to "${input}".
  
  Please follow these guidelines:
  1. Return exactly ${longListCount} items, no more and no less.
  2. Format your response as a numbered list (1., 2., 3., etc.)
  3. Each item should be brief but descriptive.
  4. Avoid duplicates within your list.
  5. Focus on the most relevant and significant examples.
  6. Only provide the list - do not include explanations, introductions, or conclusions.
  
  Your list of ${longListCount} items similar to "${input}":`;
  };
  
  /**
   * Parse numbered list from LLM response
   */
  const parseNumberedList = (content) => {
    if (!content) return [];
    
    // Regular expression to match numbered list items
    // This handles different numbering formats (1., 1), etc.
    const regex = /\d+[\.\)]\s*(.*?)(?=\n\d+[\.\)]|\n\n|$)/gs;
    const matches = [...content.matchAll(regex)];
    
    return matches.map(match => match[1].trim());
  };
  
  /**
   * Query a single LLM model
   */
  const queryLLM = async (model, prompt, updateProgress) => {
    try {
      // Update progress status
      updateProgress(model, 'requesting');
      
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Listy App'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error from ${model}: ${errorData.error?.message || 'Unknown error'}`);
      }
  
      const data = await response.json();
      
      // Add check for valid choices array
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        const errorMessage = `Invalid response structure from ${model}: Missing expected content.`;
        console.error(`Error querying ${model}:`, errorMessage, data); // Log the actual data received
        updateProgress(model, 'error');
        return {
          model,
          error: errorMessage,
          content: null
        };
      }

      updateProgress(model, 'success');
      
      return {
        model,
        content: data.choices[0].message.content
      };
    } catch (error) {
      console.error(`Error querying ${model}:`, error);
      updateProgress(model, 'error');
      
      return {
        model,
        error: error.message,
        content: null
      };
    }
  };
  
  /**
   * Query all LLMs in parallel
   */
  export const queryLLMs = async (input, longListCount, updateProgress = () => {}) => {
    const prompt = generateListPrompt(input, longListCount);
    
    // Make requests to all LLMs in parallel
    const promises = LLM_MODELS.map(model => 
      queryLLM(model, prompt, updateProgress)
    );
    
    const responses = await Promise.all(promises);
    
    // Process responses
    const results = {};
    let successCount = 0;
    
    responses.forEach(response => {
      const { model, content, error } = response;
      
      if (content) {
        const items = parseNumberedList(content);
        results[model] = {
          items,
          error: items.length < longListCount ? 
            `Expected ${longListCount} items but got ${items.length}` : 
            null
        };
        successCount++;
      } else {
        results[model] = {
          items: [],
          error
        };
      }
    });
    
    if (successCount === 0) {
      throw new Error('Failed to get valid responses from any LLM. Please check your API key and try again.');
    }
    
    console.log('LLM responses:', Object.keys(results));
    
    return results;
  };