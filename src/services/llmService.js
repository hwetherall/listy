// List of LLM models to query
export const LLM_MODELS = [
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
  
  // Fast mode LLM list - only includes the 6 specified providers
  const FAST_MODE_LLMS = [
    'cohere/command-r7b-12-2024',
    'meta-llama/llama-4-scout',
    'perplexity/sonar-pro',
    'openai/gpt-4o-search-preview',
    'anthropic/claude-3.7-sonnet',
    'google/gemma-3-27b-it'
  ];
  
  // Get API key from environment variables
  const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
  const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  // New prompt generators for specialized competitor categories with refinements

  const generateIncumbentPrompt = (companyName, companyDescription, count) => {
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

  const generateRegionalPrompt = (companyName, companyDescription, count) => {
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

  const generateInterestingPrompt = (companyName, companyDescription, count) => {
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

  const generateGraveyardPrompt = (companyName, companyDescription, count) => {
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
      
      // Add check for valid choices array
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        const errorMessage = `Invalid response structure from ${model}: Missing expected content.`;
        console.error(`Error querying ${model}:`, errorMessage, data); // Log the actual data received
        updateProgress(model, 'error', responseTime);
        return {
          model,
          error: errorMessage,
          content: null,
          responseTime
        };
      }

      updateProgress(model, 'success', responseTime);
      
      return {
        model,
        content: data.choices[0].message.content,
        responseTime
      };
    } catch (error) {
      console.error(`Error querying ${model}:`, error);
      updateProgress(model, 'error');
      
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
    customModels = null
  ) => {
    // Generate prompts for each category
    const incumbentPrompt = generateIncumbentPrompt(companyName, companyDescription, longListCount);
    const regionalPrompt = generateRegionalPrompt(companyName, companyDescription, 10);
    const interestingPrompt = generateInterestingPrompt(companyName, companyDescription, 10);
    const graveyardPrompt = generateGraveyardPrompt(companyName, companyDescription, 10);
  
    // Determine which models to use
    let selectedModels;
    
    if (customModels && customModels.length > 0) {
      selectedModels = customModels;
    } else if (fastMode) {
      selectedModels = FAST_MODE_LLMS;
    } else {
      selectedModels = LLM_MODELS;
    }
    
    // Make requests to all LLMs for all categories in parallel
    const incumbentPromises = selectedModels.map(model => 
      queryLLM(model, incumbentPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime, 'incumbent');
      })
    );

    const regionalPromises = selectedModels.map(model => 
      queryLLM(model, regionalPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime, 'regional');
      })
    );

    const interestingPromises = selectedModels.map(model => 
      queryLLM(model, interestingPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime, 'interesting');
      })
    );

    const graveyardPromises = selectedModels.map(model => 
      queryLLM(model, graveyardPrompt, (status, responseTime) => {
        updateProgress(model, status, responseTime, 'graveyard');
      })
    );
    
    // Wait for all promises to resolve
    const [incumbentResponses, regionalResponses, interestingResponses, graveyardResponses] = 
      await Promise.all([
        Promise.all(incumbentPromises),
        Promise.all(regionalPromises),
        Promise.all(interestingPromises),
        Promise.all(graveyardPromises)
      ]);
    
    // Process all responses by category
    const processCategory = (responses, category) => {
      const results = {};
      let successCount = 0;
      
      responses.forEach((response, index) => {
        const { model, content, error, responseTime } = response;
        
        if (content) {
          const items = parseNumberedList(content);
          results[model] = {
            items,
            category,
            error: null,
            responseTime,
          };
          successCount++;
        } else {
          results[model] = {
            items: [],
            category,
            error,
            responseTime: responseTime || 0
          };
        }
      });
      
      return { results, successCount };
    };
    
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