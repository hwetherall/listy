// Get API key from environment variables
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use the most powerful free model for normalization
const NORMALIZER_MODEL = 'google/gemini-2.5-pro-exp-03-25:free';

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
 * Normalize the results using the Normalizer LLM
 */
export const normalizeResults = async (results) => {
  // Combine all items from all LLMs into a single list
  const allItems = Object.values(results)
    .flatMap(result => result.items)
    .filter(item => item && item.trim()) // Remove any null, undefined, or empty items
    .map(item => item.trim());
  
  // Remove duplicates for the normalization prompt
  // (we'll normalize the full list later)
  const uniqueItems = [...new Set(allItems)];
  
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
    const content = data.choices[0].message.content;
    
    // Extract and parse the JSON from the response
    const normalizationMap = extractJsonFromResponse(content);
    
    // Apply normalization to all results
    const normalizedResults = {};
    
    Object.entries(results).forEach(([model, result]) => {
      normalizedResults[model] = {
        ...result,
        // Map each item to its normalized form, or keep as is if not in the map
        items: result.items.map(item => 
          item ? (normalizationMap[item.trim()] || item) : item
        )
      };
    });
    
    return normalizedResults;
  } catch (error) {
    console.error('Normalization error:', error);
    throw new Error(`Normalization failed: ${error.message}`);
  }
};