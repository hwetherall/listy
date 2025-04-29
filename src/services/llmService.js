// Import the custom environment variables
import env from '../utils/customEnv';

// List of LLM models to query
export const LLM_MODELS = [
  // 'microsoft/mai-ds-r1:free', // Removed - slow and ineffectual
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
  
  // Fast mode LLM list - only includes the 6 specified providers
  const FAST_MODE_LLMS = [
    'cohere/command-r7b-12-2024',
    'meta-llama/llama-4-scout',
    'perplexity/sonar-pro',
    'openai/gpt-4o-search-preview',
    'anthropic/claude-3.7-sonnet',
    'google/gemma-3-27b-it'
  ];
  
  // Get API key and base URL from the custom env utility
  const API_KEY = env.OPENROUTER_API_KEY;
  const BASE_URL = env.OPENROUTER_BASE_URL;
  
  // Export prompt generators for specialized competitor categories

  export const generateIncumbentPrompt = (companyName, companyDescription, count) => {
    return `You are a competitive intelligence expert specializing in market research. Your task is to generate a list of up to ${count} INCUMBENT companies that directly compete with "${companyName}".

Additional company context: ${companyDescription}

For INCUMBENTS, focus on:
1. Established, large players in the same market as ${companyName}
2. Well-known, primary competitors with significant market share
3. Companies whose core products/services directly compete with ${companyName}'s offerings and target overlapping customer segments // Refined for clarity on directness and customer overlap

Please follow these guidelines:
1. List up to ${count} distinct incumbent competitors
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Uber" not "Uber - a ridesharing app")
4. Only include true direct competitors, not partners or suppliers
5. Only provide the list - no explanations or introductions

Your list of incumbent competitors to "${companyName}":`;
  };

  export const generateRegionalPrompt = (companyName, companyDescription, count) => {
    // Note: This version assumes the AI should *infer* the region from the description.
    // If you can pass the region(s) explicitly, modify this function to accept and use them.
    return `You are a competitive intelligence expert focusing on regional market analysis. For the company "${companyName}", identify up to ${count} REGION-SPECIFIC competitors.

Additional company context: ${companyDescription}

// Added instruction for AI to infer region from context
Based on the provided company context, infer the primary geographic operating region(s) of ${companyName}. Focus your search for competitors primarily active within those specific regions.

For REGIONAL PLAYERS, focus on:
1. Companies that operate primarily in specific geographic regions rather than globally
2. Local alternatives to ${companyName} within specific geographic markets // Refined for clarity
3. Region-specific competitors with strong local presence
4. Companies that may be large in their region but less known globally

Please follow these guidelines:
1. List up to ${count} distinct regional competitors
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Grab" not "Grab - Southeast Asian ride-hailing")
4. Only provide the list - no explanations or introductions

Your list of regional competitors to "${companyName}":`;
  };

  export const generateInterestingPrompt = (companyName, companyDescription, count) => {
    return `You are a competitive intelligence expert focusing on unique business models and market dynamics. For the company "${companyName}", identify up to ${count} INTERESTING competitors.

Additional company context: ${companyDescription}

// Added clarification on the *purpose* of this list
The goal is to identify competitors that represent novel threats, innovative strategies, or market shifts relevant to ${companyName}.

For INTERESTING CASES, focus on:
1. Companies tackling the same customer problem as ${companyName} but with significantly innovative or disruptive technology, business models, or value propositions // Refined for specificity
2. Large, established companies from adjacent industries that are actively entering or exploring ${companyName}'s market space // Refined for clarity on activity level
3. Startups with novel technologies or business models challenging incumbents
4. Companies that pivoted into this space from different industries

Please follow these guidelines:
1. List up to ${count} distinct interesting competitors
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Tortoise" not "Tortoise - autonomous repositioning scooters")
4. Only provide the list - no explanations or introductions

Your list of interesting competitors to "${companyName}":`;
  };

  export const generateGraveyardPrompt = (companyName, companyDescription, count) => {
    return `You are a competitive intelligence expert focusing on market history. For the company "${companyName}", identify up to ${count} FORMER competitors.

Additional company context: ${companyDescription}

// Refined main instruction to clarify "former direct competitors"
Identify up to ${count} companies that *were previously* significant direct competitors to ${companyName} but are no longer active threats in their original form.

For GRAVEYARD cases, focus on:
1. Companies in this specific market that went bankrupt or ceased operations // Refined for market specificity
2. Competitors that were acquired by larger players (and potentially absorbed/discontinued)
3. Companies that previously competed directly but pivoted their core business away from this market // Refined for pivot context
4. Once-prominent players in this market that have significantly declined or become negligible competitors

Please follow these guidelines:
1. List up to ${count} distinct former competitors
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Spin" not "Spin - acquired by Tier in 2023")
4. Only provide the list - no explanations or introductions

Your list of former competitors to "${companyName}":`;
  };
  
  // Export region-specific prompt generator for report mode
  export const generateRegionSpecificPrompt = (companyName, companyDescription, region, count) => {
    return `You are a competitive intelligence expert focusing on regional market analysis. For the company "${companyName}", identify up to ${count} REGION-SPECIFIC competitors in ${region}.

Additional company context: ${companyDescription}

For REGIONAL PLAYERS in ${region}, focus on:
1. Companies that operate primarily in ${region} rather than globally
2. Local alternatives to ${companyName} within ${region}
3. Region-specific competitors with strong local presence in ${region}
4. Companies that may be large in ${region} but less known globally

Please follow these guidelines:
1. List exactly ${count} distinct regional competitors in ${region}
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Grab" not "Grab - Southeast Asian ride-hailing")
4. Only provide the list - no explanations or introductions

Your list of ${region} regional competitors to "${companyName}":`;
  };
  
  /**
   * Parse numbered list from LLM response
   */
  const parseNumberedList = (content) => {
    if (!content) return [];
    
    console.log("Content to parse:", content);
    
    // Regular expression to match numbered list items
    // This handles different numbering formats (1., 1), etc.
    const regex = /\d+[\.\)]\s*(.*?)(?=\n\d+[\.\)]|\n\n|$)/gs;
    const matches = [...content.matchAll(regex)];
    
    console.log("Matches found:", matches.length);
    
    const result = matches.map(match => match[1].trim());
    console.log("Parsed items:", result);
    
    return result;
  };
  
  /**
   * Query a single LLM model
   */
  const queryLLM = async (model, prompt, updateProgress, category = '') => {
    try {
      // Update progress status
      updateProgress('requesting', 0);
      
      // Check if API key is available
      if (!API_KEY) {
        throw new Error('No OpenRouter API key available. Please provide REACT_APP_OPENROUTER_API_KEY in your environment.');
      }
      
      // Debug API key being used
      console.log(`Querying ${model} with API key (first 10 chars): ${API_KEY.substring(0, 10)}...`);
      
      // Start timing
      const startTime = Date.now();
      
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
      
      // Calculate response time in seconds (rounded to 2 decimal places)
      const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`Raw response from ${model}:`, data);
      
      // Add check for valid choices array
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        const errorMessage = `Invalid response structure from ${model}: Missing expected content.`;
        console.error(`Error querying ${model}:`, errorMessage, data); // Log the actual data received
        updateProgress('error', responseTime);
        return {
          model,
          error: errorMessage,
          content: null,
          responseTime
        };
      }

      updateProgress('success', responseTime);
      
      const responseContent = data.choices[0].message.content;
      console.log(`Response content from ${model}:`, responseContent);
      
      return {
        model,
        content: responseContent,
        responseTime
      };
    } catch (error) {
      console.error(`Error querying ${model}:`, error);
      // Try to get responseTime even in error, although it might be 0
      const responseTimeOnError = (error.responseTime !== undefined) ? error.responseTime : 0;
      updateProgress('error', responseTimeOnError);
      
      return {
        model,
        error: error.message,
        content: null,
        responseTime: 0
      };
    }
  };
  
  /**
   * Query all LLMs in parallel for multiple competitor categories
   */
  export const queryLLMs = async (
    companyName, 
    companyDescription, 
    longListCount, 
    updateProgress = () => {},
    fastMode = false,
    customModels = null,
    specificCategory = null,
    specificPrompt = null
  ) => {
    // Check if API key is available
    if (!API_KEY) {
      throw new Error('No OpenRouter API key available. Please provide REACT_APP_OPENROUTER_API_KEY in your environment.');
    }

    // Generate prompts for each category
    const incumbentPrompt = specificCategory === 'incumbent' && specificPrompt ? 
      specificPrompt : generateIncumbentPrompt(companyName, companyDescription, longListCount);
      
    const regionalPrompt = specificCategory === 'regional' && specificPrompt ? 
      specificPrompt : generateRegionalPrompt(companyName, companyDescription, 10);
      
    const interestingPrompt = specificCategory === 'interesting' && specificPrompt ? 
      specificPrompt : generateInterestingPrompt(companyName, companyDescription, 10);
      
    const graveyardPrompt = specificCategory === 'graveyard' && specificPrompt ? 
      specificPrompt : generateGraveyardPrompt(companyName, companyDescription, 10);

    // Determine which models to use
    let selectedModels;
    
    if (customModels && customModels.length > 0) {
      selectedModels = customModels;
    } else if (fastMode) {
      selectedModels = FAST_MODE_LLMS;
    } else {
      selectedModels = LLM_MODELS;
    }
    
    // Process responses by category helper function
    const processCategory = (responses, category) => {
      const results = {};
      let successCount = 0;
      
      console.log(`Processing ${responses.length} responses for category ${category}`);
      
      responses.forEach((response, index) => {
        const { model, content, error, responseTime } = response;
        
        console.log(`Response from ${model} for ${category}:`, { 
          hasContent: !!content, 
          contentLength: content ? content.length : 0,
          error 
        });
        
        if (content) {
          const items = parseNumberedList(content);
          console.log(`Extracted ${items.length} items from ${model} for ${category}`);
          results[model] = {
            items,
            category,
            error: null,
            responseTime,
          };
          successCount++;
        } else {
          console.log(`No content to extract items from ${model} for ${category}`);
          results[model] = {
            items: [],
            category,
            error,
            responseTime: responseTime || 0
          };
        }
      });
      
      console.log(`Successfully processed ${successCount} responses for ${category}`);
      console.log(`Results structure for ${category}:`, results);
      
      return { results, successCount };
    };

    // If a specific category is requested, only query for that category
    if (specificCategory) {
      let categoryPrompt;
      
      switch(specificCategory) {
        case 'incumbent':
          categoryPrompt = incumbentPrompt;
          break;
        case 'regional':
          categoryPrompt = regionalPrompt;
          break;
        case 'interesting':
          categoryPrompt = interestingPrompt;
          break;
        case 'graveyard':
          categoryPrompt = graveyardPrompt;
          break;
        default:
          throw new Error(`Unknown category: ${specificCategory}`);
      }
      
      const promises = selectedModels.map(model => 
        queryLLM(model, categoryPrompt, (status, responseTime) => {
          updateProgress(model, status, responseTime);
        }, specificCategory)
      );
      
      const responses = await Promise.all(promises);
      const { results } = processCategory(responses, specificCategory);
      
      // Return results structured the same way as the full query
      const combinedResults = {};
      combinedResults[specificCategory] = results;
      
      return combinedResults;
    }
    
    // Otherwise, make requests to all LLMs for all categories in parallel
    const incumbentPromises = selectedModels.map(model => 
      queryLLM(model, incumbentPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime);
      }, 'incumbent')
    );

    const regionalPromises = selectedModels.map(model => 
      queryLLM(model, regionalPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime);
      }, 'regional')
    );

    const interestingPromises = selectedModels.map(model => 
      queryLLM(model, interestingPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime);
      }, 'interesting')
    );

    const graveyardPromises = selectedModels.map(model => 
      queryLLM(model, graveyardPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime);
      }, 'graveyard')
    );
    
    // Wait for all promises to resolve
    const [incumbentResponses, regionalResponses, interestingResponses, graveyardResponses] = 
      await Promise.all([
        Promise.all(incumbentPromises),
        Promise.all(regionalPromises),
        Promise.all(interestingPromises),
        Promise.all(graveyardPromises)
      ]);
    
    const { results: incumbentResults, successCount: incumbentSuccess } = 
      processCategory(incumbentResponses, 'incumbent');

    const { results: regionalResults, successCount: regionalSuccess } = 
      processCategory(regionalResponses, 'regional');

    const { results: interestingResults, successCount: interestingSuccess } = 
      processCategory(interestingResponses, 'interesting');

    const { results: graveyardResults, successCount: graveyardSuccess } = 
      processCategory(graveyardResponses, 'graveyard');

    // Combine all results
    const combinedResults = {
      incumbent: incumbentResults,
      regional: regionalResults,
      interesting: interestingResults,
      graveyard: graveyardResults
    };
    
    // Ensure at least some responses were successful
    const totalSuccessCount = incumbentSuccess + regionalSuccess + interestingSuccess + graveyardSuccess;

    if (totalSuccessCount === 0) {
      throw new Error('Failed to get valid responses from any LLM. Please check your API key and try again.');
    }
    
    console.log('LLM responses received for all categories');
    
    return combinedResults;
  };