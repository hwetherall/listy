// Import the custom environment variables
import env from '../utils/customEnv';

// Get API key and base URL from the custom env utility
const API_KEY = env.OPENROUTER_API_KEY;
const BASE_URL = env.OPENROUTER_BASE_URL;

// Use a different free model for normalization as Google model was causing errors
// Trying Mistral Small for potentially better speed
const NORMALIZER_MODEL = 'mistralai/mistral-small-3.1-24b-instruct:free';

/**
 * Generate prompt for normalization
 */
const generateNormalizationPrompt = (combinedList) => {
  return `You are an expert at data normalization and entity recognition. I have collected lists of items from multiple AI models, and I need you to normalize these items to identify duplicates and variations of the same entity.

Here is the combined list of items:
${combinedList}

Please follow these guidelines:
1. Identify items that refer to the same entity (e.g., "Meta" and "Facebook", "NYC" and "New York City", "SpaceX" and "Space X", etc.)
2. Create a mapping of original items to their normalized form
3. Use the most common or official name as the normalized form when possible
4. Format your response as a JSON object where keys are original items and values are normalized items
5. If an item doesn't need normalization, map it to itself
6. Be thorough - capture all possible duplicates, abbreviations, and variations

For example, if the list contains "Facebook", "Meta", and "Meta Platforms", your JSON might have:
{
  "Facebook": "Meta Platforms Inc.",
  "Meta": "Meta Platforms Inc.",
  "Meta Platforms": "Meta Platforms Inc."
}

Return ONLY the JSON object without any explanations or additional text.`;
};

/**
 * Extract JSON from the LLM response
 */
const extractJsonFromResponse = (content) => {
  try {
    // Try to parse the entire response as JSON first
    return JSON.parse(content);
  } catch (e) {
    // Look for JSON in code blocks or just braces
    const jsonMatch = 
      content.match(/```(?:json)?\n([\s\S]*?)\n```/) || // Markdown code block
      content.match(/`({[\s\S]*?})`/) ||               // Inline code
      content.match(/({[\s\S]*})/) ||                  // Just the JSON object
      content.match(/{[\s\S]*}/);                      // Last resort: find anything between braces
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (jsonError) {
        throw new Error(`Failed to parse JSON in response: ${jsonError.message}`);
      }
    }
    
    throw new Error('No valid JSON found in the response');
  }
};

/**
 * Remove duplicate companies across categories based on priority rules
 * Priority order: Incumbent > Regional > Interesting > Graveyard
 */
const deduplicateAcrossCategories = (normalizedResults) => {
  // Define priority order for categories
  const categoryPriority = {
    'incumbent': 1,
    'regional': 2,
    'interesting': 3,
    'graveyard': 4
  };
  
  // Keep track of companies we've seen and their categories
  const seenCompanies = new Map();
  
  // First pass: identify all normalized companies and their categories
  Object.entries(normalizedResults).forEach(([category, modelData]) => {
    if (!modelData || !modelData.items || !Array.isArray(modelData.items)) return;
    
    modelData.items.forEach(company => {
      if (!company) return;
      
      const normalizedCompany = company.trim();
      
      // If we haven't seen this company before or current category has higher priority
      if (!seenCompanies.has(normalizedCompany) || 
          categoryPriority[category] < categoryPriority[seenCompanies.get(normalizedCompany)]) {
        seenCompanies.set(normalizedCompany, category);
      }
    });
  });
  
  // Second pass: filter out companies that should be in a different category
  const dedupedResults = {};
  Object.entries(normalizedResults).forEach(([category, modelData]) => {
    if (!modelData || !modelData.items || !Array.isArray(modelData.items)) {
      dedupedResults[category] = modelData;
      return;
    }
    
    dedupedResults[category] = {
      ...modelData,
      items: modelData.items.filter(company => {
        if (!company) return false;
        
        const normalizedCompany = company.trim();
        // Keep the company if it belongs in this category based on priority
        return seenCompanies.get(normalizedCompany) === category;
      })
    };
  });
  
  return dedupedResults;
};

/**
 * Normalize the results using the Normalizer LLM
 */
export const normalizeResults = async (results) => {
  // Extract items from the nested structure of results
  const allItems = [];
  
  console.log("Raw results structure received for normalization:", JSON.stringify(results, null, 2));
  
  // Updated processing logic to directly handle the model structure
  Object.entries(results).forEach(([modelName, modelData]) => {
    console.log(`Processing model: ${modelName}`);
    
    if (modelData && modelData.items) {
      console.log(`Found ${modelData.items.length} items for model ${modelName}`);
      
      // Add each item from this model to the combined list
      modelData.items.forEach(item => {
        if (item && item.trim()) {
          allItems.push(item.trim());
        }
      });
    } else {
      console.log(`No items array found for model ${modelName} or it's empty`);
    }
  });
  
  console.log("All extracted items:", allItems);
  
  // Remove duplicates for the normalization prompt
  const uniqueItems = [...new Set(allItems)];
  
  console.log("Unique items for normalization:", uniqueItems);
  console.log("Unique items count:", uniqueItems.length);
  
  if (uniqueItems.length === 0) {
    throw new Error('No valid items to normalize');
  }
  
  // Format the list for the prompt
  const combinedList = uniqueItems.join('\n');
  const prompt = generateNormalizationPrompt(combinedList);
  
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Listy App'
      },
      body: JSON.stringify({
        model: NORMALIZER_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // Lower temperature for more consistent results
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Normalization error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Add check for valid choices array
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      const errorMessage = `Invalid response structure from normalizer model (${NORMALIZER_MODEL}): Missing expected content.`;
      console.error('Normalization error:', errorMessage, data); // Log the actual data received
      throw new Error(errorMessage);
    }

    const content = data.choices[0].message.content;
    
    // Log the raw content before parsing
    console.log("Raw content from normalizer:", content); 

    // Extract and parse the JSON from the response
    const normalizationMap = extractJsonFromResponse(content);
    
    // Log the parsed normalization map
    console.log("Parsed Normalization Map:", normalizationMap);

    // Apply normalization to all results, maintaining the structure
    const normalizedResults = {};
    
    // Process each model directly
    Object.entries(results).forEach(([modelName, modelData]) => {
      normalizedResults[modelName] = {
        ...modelData,
        // Map each item to its normalized form, or keep as is if not in the map
        items: modelData.items.map(item => 
          item ? (normalizationMap[item.trim()] || item) : item
        )
      };
    });
    
    // Apply cross-category deduplication based on priority rules
    const dedupedResults = deduplicateAcrossCategories(normalizedResults);
    
    // Log before and after counts to verify deduplication
    console.log("Before deduplication (items per category):", 
      Object.entries(normalizedResults).reduce((acc, [cat, data]) => {
        acc[cat] = data.items ? data.items.length : 0;
        return acc;
      }, {})
    );
    
    console.log("After deduplication (items per category):", 
      Object.entries(dedupedResults).reduce((acc, [cat, data]) => {
        acc[cat] = data.items ? data.items.length : 0;
        return acc;
      }, {})
    );
    
    return dedupedResults;
  } catch (error) {
    console.error('Normalization error:', error);
    throw new Error(`Normalization failed: ${error.message}`);
  }
};