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
  
// Add Gemini model for pre-processing reports
export const GEMINI_MODEL = 'google/gemini-2.5-flash-preview';
export const SUMMARY_MODEL = 'anthropic/claude-3.7-sonnet';
// Add model for generating VC-style competitor report
export const REPORT_MODEL = 'google/gemini-2.5-pro-preview-03-25';
  
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
  return `You are a competitive intelligence expert specializing in market research. Your task is to generate a list of EXACTLY 10 INCUMBENT companies that directly compete with "${companyName}".

Additional company context: ${companyDescription}

For INCUMBENTS, focus on:
1. Established, large players in the same market as ${companyName}
2. Well-known, primary competitors with significant market share
3. Companies whose core products/services directly compete with ${companyName}'s offerings and target overlapping customer segments

Please follow these guidelines:
1. List EXACTLY 10 incumbent competitors - no more, no less
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Uber" not "Uber - a ridesharing app")
4. Only include true direct competitors, not partners or suppliers
5. Do not skip numbers or leave blank entries
6. Only provide the list - no explanations or introductions
7. If you cannot find 10 proper incumbents, use your knowledge to identify companies that most closely match the criteria

Your list of 10 incumbent competitors to "${companyName}":`;
};

export const generateRegionalPrompt = (companyName, companyDescription, count) => {
  // Note: This version assumes the AI should *infer* the region from the description.
  // If you can pass the region(s) explicitly, modify this function to accept and use them.
  return `You are a competitive intelligence expert focusing on regional market analysis. For the company "${companyName}", identify AT LEAST 5 and up to ${count} REGION-SPECIFIC competitors.

Additional company context: ${companyDescription}

// Added instruction for AI to infer region from context
Based on the provided company context, infer the primary geographic operating region(s) of ${companyName}. Focus your search for competitors primarily active within those specific regions.

For REGIONAL PLAYERS, focus on:
1. Companies that operate primarily in specific geographic regions rather than globally
2. Local alternatives to ${companyName} within specific geographic markets
3. Region-specific competitors with strong local presence
4. Companies that may be large in their region but less known globally

Please follow these guidelines:
1. List AT LEAST 5 distinct regional competitors, and up to ${count} if you can identify them
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Grab" not "Grab - Southeast Asian ride-hailing")
4. If you cannot identify at least 5 proper regional competitors, use your knowledge to identify companies that most closely match the criteria
5. Only provide the list - no explanations or introductions

Your list of regional competitors to "${companyName}":`;
};

export const generateInterestingPrompt = (companyName, companyDescription, count) => {
  return `You are a competitive intelligence expert focusing on unique business models and market dynamics. For the company "${companyName}", identify up to ${count} NOVEL and DISRUPTIVE competitors.

Additional company context: ${companyDescription}

The goal is to identify TRULY INNOVATIVE competitors that represent significant threats or paradigm shifts relevant to ${companyName}'s business model.

For INTERESTING CASES, focus EXCLUSIVELY on:
1. Companies using cutting-edge technologies or radically different business models to solve the same customer problems as ${companyName}
2. Startups with highly novel approaches that could potentially leapfrog traditional competitors
3. Companies from completely different industries that have recently entered ${companyName}'s market with fresh perspectives
4. Businesses that have created entirely new categories adjacent to ${companyName}'s space

DO NOT include:
- Traditional competitors with minor innovations
- Companies simply using standard technology trends
- Businesses that are just smaller versions of existing players

Please follow these guidelines:
1. List up to ${count} distinct innovative competitors
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Notion" not "Notion - workspace with novel block structure")
4. Only provide the list - no explanations or introductions

Your list of INNOVATIVE competitors to "${companyName}":`;
};

export const generateGraveyardPrompt = (companyName, companyDescription, count) => {
  return `You are a competitive intelligence expert focusing on market history. For the company "${companyName}", identify up to ${count} FAILED or DEFUNCT former competitors.

Additional company context: ${companyDescription}

Identify up to ${count} companies that were previously competitors to ${companyName} but have experienced NEGATIVE OUTCOMES.

For GRAVEYARD cases, focus EXCLUSIVELY on:
1. Companies that went bankrupt, collapsed, or completely ceased operations
2. Competitors that were forced to shut down due to regulatory action or were banned from operating
3. Companies that were acquired in distressed conditions or at bargain basement prices (NOT successful exits)
4. Once-prominent players in this market that have catastrophically declined or failed

DO NOT include:
- Companies that were acquired in successful exits or normal M&A activity
- Companies that simply pivoted to a different market
- Companies that still exist but just aren't major players anymore

Please follow these guidelines:
1. List up to ${count} distinct failed competitors
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Theranos" not "Theranos - shut down after fraud")
4. Only provide the list - no explanations or introductions

Your list of FAILED competitors to "${companyName}":`;
};
  
// Export region-specific prompt generator for report mode
export const generateRegionSpecificPrompt = (companyName, companyDescription, region, count) => {
  return `You are a competitive intelligence expert focusing on regional market analysis. For the company "${companyName}", identify AT LEAST 5 and up to ${count} REGION-SPECIFIC competitors in ${region}.

Additional company context: ${companyDescription}

For REGIONAL PLAYERS in ${region}, focus on:
1. Companies that operate primarily in ${region} rather than globally
2. Local alternatives to ${companyName} within ${region}
3. Region-specific competitors with strong local presence in ${region}
4. Companies that may be large in ${region} but less known globally

Please follow these guidelines:
1. List AT LEAST 5 distinct regional competitors in ${region}, and up to ${count} if you can identify them
2. Format your response as a numbered list (1., 2., 3., etc.)
3. List ONLY the company name (e.g., "Grab" not "Grab - Southeast Asian ride-hailing")
4. If you cannot identify at least 5 proper regional competitors in ${region}, use your knowledge to identify companies that most closely match the criteria
5. Only provide the list - no explanations or introductions

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

/**
 * Generate summaries for companies
 */
export const generateCompanySummaries = async (companies, companyType, companyName, companyDescription) => {
  try {
    if (!companies || companies.length === 0) {
      return {};
    }
    
    // Create a specialized prompt for Graveyard companies
    let prompt;
    
    if (companyType === 'Graveyard Companies') {
      prompt = `You are a competitive intelligence expert summarizing failed competitors for ${companyName}.
    
Company description: ${companyDescription}

For each FAILED company listed below, provide a concise 2-3 sentence summary that:
1. Briefly describes what the company did (1 sentence only)
2. FOCUSES ON EXPLAINING THE SPECIFIC REASON FOR FAILURE (1-2 sentences)
   - If bankruptcy, mention when and why
   - If regulatory shutdown, explain what regulation/issue caused it
   - If acquired in distress, mention the buyer and distressed price/conditions
   - If catastrophic decline, explain what caused the decline

The explanation of failure is the MOST IMPORTANT part - be specific about what went wrong.

Format your response as follows:
[Company1]: Summary of Company1...
[Company2]: Summary of Company2...

Failed companies to summarize:
${companies.map(company => `- ${company}`).join('\n')}`;
    } else {
      // Standard prompt for other company types
      prompt = `You are a competitive intelligence expert summarizing ${companyType} for ${companyName}.
    
Company description: ${companyDescription}

For each company listed below, provide a concise 2-3 sentence summary focusing on:
1. What the company does
2. Their competitive position relative to ${companyName}
3. Key strengths or weaknesses

Format your response as follows:
[Company1]: Summary of Company1...
[Company2]: Summary of Company2...

Companies to summarize:
${companies.map(company => `- ${company}`).join('\n')}`;
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Listy App'
      },
      body: JSON.stringify({
        model: SUMMARY_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error generating summaries: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse summaries from the response
    const summaries = {};
    
    companies.forEach(company => {
      // Look for [Company]: Summary pattern
      const regex = new RegExp(`\\[${company}\\]:\\s*(.+?)(?=\\[|$)`, 's');
      const match = content.match(regex);
      
      if (match && match[1]) {
        summaries[company] = match[1].trim();
      } else {
        // Fallback if the format isn't exact
        summaries[company] = `A competitor in the ${companyType.toLowerCase()} category.`;
      }
    });
    
    return summaries;
  } catch (error) {
    console.error('Error generating summaries:', error);
    // Return basic summaries if there's an error
    const fallbackSummaries = {};
    companies.forEach(company => {
      fallbackSummaries[company] = `A competitor in the ${companyType.toLowerCase()} category.`;
    });
    return fallbackSummaries;
  }
};

/**
 * Pre-process report main function
 */
export const preprocessReport = async (categorizedResults, companyName, companyDescription, updateProgress = () => {}) => {
  try {
    // Take top companies from each category - now 5 from each
    const topIncumbents = categorizedResults.incumbent?.slice(0, 5) || [];
    const topRegional = categorizedResults.regional?.slice(0, 5) || [];
    const topInteresting = categorizedResults.interesting?.slice(0, 5) || [];
    const topGraveyard = categorizedResults.graveyard?.slice(0, 5) || [];
    
    // Extract just the company names
    const incumbentNames = topIncumbents.map(item => item.item);
    const regionalNames = topRegional.map(item => item.item);
    const interestingNames = topInteresting.map(item => item.item);
    const graveyardNames = topGraveyard.map(item => item.item);
    
    // Update progress - skip validation
    updateProgress('summarizing', 0);
    
    // Generate summaries for all companies (no validation step)
    const [incumbentSummaries, regionalSummaries, interestingSummaries, graveyardSummaries] = await Promise.all([
      generateCompanySummaries(incumbentNames, 'Incumbent Companies', companyName, companyDescription),
      generateCompanySummaries(regionalNames, 'Regional Players', companyName, companyDescription),
      generateCompanySummaries(interestingNames, 'Interesting Cases', companyName, companyDescription),
      generateCompanySummaries(graveyardNames, 'Graveyard Companies', companyName, companyDescription)
    ]);
    
    // Update progress
    updateProgress('complete', 100);
    
    // Combine results
    const results = [
      ...incumbentNames.map(company => ({
        company,
        type: 'Incumbent',
        description: incumbentSummaries[company] || ''
      })),
      ...regionalNames.map(company => ({
        company,
        type: 'Regional',
        description: regionalSummaries[company] || ''
      })),
      ...interestingNames.map(company => ({
        company,
        type: 'Interesting',
        description: interestingSummaries[company] || ''
      })),
      ...graveyardNames.map(company => ({
        company,
        type: 'Graveyard',
        description: graveyardSummaries[company] || ''
      }))
    ];
    
    return {
      results,
      stats: {
        incumbent: {
          total: incumbentNames.length,
          valid: incumbentNames.length, // All companies are valid now
          invalid: 0
        },
        regional: {
          total: regionalNames.length,
          valid: regionalNames.length, // All companies are valid now
          invalid: 0
        },
        interesting: {
          total: interestingNames.length,
          valid: interestingNames.length, // All companies are valid now
          invalid: 0
        },
        graveyard: {
          total: graveyardNames.length,
          valid: graveyardNames.length, // All companies are valid now
          invalid: 0
        }
      }
    };
  } catch (error) {
    console.error('Error preprocessing report:', error);
    throw new Error(`Failed to preprocess report: ${error.message}`);
  }
};

/**
 * Generate a comprehensive VC-style competitor report
 */
export const generateCompetitorReport = async (reportResults, companyName, companyDescription, updateProgress = () => {}) => {
  try {
    if (!reportResults || !reportResults.results || reportResults.results.length === 0) {
      throw new Error('No report results available for generating competitor report');
    }
    
    // Update progress
    updateProgress('generating', 0);
    
    // Group results by type for the prompt
    const groupedResults = reportResults.results.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
    
    // Format the company data for the prompt
    const incumbentSection = groupedResults.Incumbent ? 
      groupedResults.Incumbent.map(item => `${item.company}: ${item.description}`).join('\n\n') : 
      'No incumbent competitors identified.';
    
    const regionalSection = groupedResults.Regional ? 
      groupedResults.Regional.map(item => `${item.company}: ${item.description}`).join('\n\n') : 
      'No regional competitors identified.';
    
    const interestingSection = groupedResults.Interesting ? 
      groupedResults.Interesting.map(item => `${item.company}: ${item.description}`).join('\n\n') : 
      'No interesting competitors identified.';
    
    const graveyardSection = groupedResults.Graveyard ? 
      groupedResults.Graveyard.map(item => `${item.company}: ${item.description}`).join('\n\n') : 
      'No graveyard companies identified.';
    
    // Create the prompt for the report
    const prompt = `You are a VC associate writing a comprehensive competitor analysis report for the partners at your firm. The report is about "${companyName}" and its competitive landscape.

Company Description: ${companyDescription}

Below is the competitive intelligence data organized by category. Use this as the foundation for your report, but expand upon it with your analysis and insights where appropriate:

# INCUMBENT COMPETITORS
${incumbentSection}

# REGIONAL PLAYERS
${regionalSection}

# INTERESTING & INNOVATIVE COMPETITORS
${interestingSection}

# GRAVEYARD (FAILED COMPETITORS)
${graveyardSection}

Your report should be structured as follows:
1. Executive Summary: Brief overview of ${companyName} and key competitive insights (1-2 paragraphs)
2. Market Context: Overview of the market landscape ${companyName} operates in (1-2 paragraphs)
3. Incumbent Analysis: Analysis of established competitors, their strengths/weaknesses, and market positioning
4. Regional Competitive Landscape: Analysis of region-specific competitors and geographic market dynamics
5. Emerging Competitors: Analysis of innovative or disruptive competitors that could pose future threats
6. Cautionary Tales: Lessons from failed competitors in this space
7. Competitive Advantage Assessment: Analysis of ${companyName}'s potential advantages and vulnerabilities vs. competitors
8. Strategic Recommendations: 3-5 key strategic considerations for ${companyName} based on the competitive landscape
9. Conclusion: Summary of key insights and final assessment of competitive position

Guidelines:
- Write in a professional, analytical VC associate style
- Focus on strategic insights rather than just summarizing the data
- Keep the total length to the equivalent of a 2-3 page report
- Use clear section headings and structured formatting
- Include specific company examples from the data provided where relevant
- If a section has no data, briefly acknowledge this but still provide insights based on the overall market context

The report should be comprehensive yet concise, providing partners with actionable insights about ${companyName}'s competitive position.`;

    // Update progress
    updateProgress('generating', 30);
    
    // Call the LLM to generate the report
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Listy App'
      },
      body: JSON.stringify({
        model: REPORT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error generating competitor report: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Check for valid response structure
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response structure from LLM when generating competitor report');
    }
    
    // Update progress
    updateProgress('complete', 100);
    
    // Return the report content
    return {
      reportContent: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error generating competitor report:', error);
    throw new Error(`Failed to generate competitor report: ${error.message}`);
  }
};