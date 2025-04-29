/**
 * Process normalized results to get the most frequent items
 * @param {Object} normalizedResults - The normalized results from all LLMs
 * @param {Number} shortListCount - Number of items to include in the final list
 * @returns {Object} Object containing sorted items and model response times
 */
export const processResults = (normalizedResults, shortListCount) => {
    // Extract model provider names for more readable output
    const getProviderName = (model) => {
      const parts = model.split('/');
      return parts[0]; // Get just the provider name (e.g., "google" from "google/gemini-2.5-pro")
    };
  
    // Combine all normalized items from all LLMs with their source
    const allItems = [];
    
    // Track model response times
    const modelResponseTimes = {};
    
    Object.entries(normalizedResults).forEach(([model, modelData]) => {
      const provider = getProviderName(model);
      
      // Store response time if available
      if (modelData.responseTime) {
        modelResponseTimes[model] = modelData.responseTime;
      }
      
      // Ensure modelData.items exists before trying to iterate over it
      if (modelData && modelData.items) {
        modelData.items.forEach(item => {
          if (item && item.trim()) {
            allItems.push({
              item: item.trim(),
              provider
            });
          }
        });
      }
    });
    
    // Count frequency of each item and track which providers included it
    const frequencyMap = {};
    
    allItems.forEach(({ item, provider }) => {
      if (!frequencyMap[item]) {
        frequencyMap[item] = {
          count: 0,
          providers: new Set()
        };
      }
      
      frequencyMap[item].count += 1;
      frequencyMap[item].providers.add(provider);
    });
    
    // Convert to array for sorting
    const sortedItems = Object.entries(frequencyMap).map(([item, { count, providers }]) => ({
      item,
      count,
      providers: Array.from(providers)
    }));
    
    // Sort by frequency (descending) and secondarily by alphabetical order
    sortedItems.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count; // Higher count first
      }
      // Same count, sort alphabetically
      return a.item.localeCompare(b.item);
    });
    
    // Take only the specified number of items (or all if fewer)
    const topItems = sortedItems.slice(0, shortListCount);
    
    return {
      items: topItems,
      modelResponseTimes
    };
};

export const processCategorizedResults = (normalizedResults, categoryLimits) => {
  const result = {};
  
  // Process each category with its own limit
  Object.entries(normalizedResults).forEach(([category, data]) => {
    // Ensure data is an object before passing to processResults
    const categoryData = typeof data === 'object' && data !== null ? data : {};
    const limit = categoryLimits[category] || 10; // Default to 10 if no limit specified
    result[category] = processResults(categoryData, limit);
  });
  
  return result;
};