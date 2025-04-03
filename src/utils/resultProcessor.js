/**
 * Process normalized results to get the most frequent items
 * @param {Object} normalizedResults - The normalized results from all LLMs
 * @param {Number} shortListCount - Number of items to include in the final list
 * @returns {Array} The processed results sorted by frequency
 */
export const processResults = (normalizedResults, shortListCount) => {
    // Extract model provider names for more readable output
    const getProviderName = (model) => {
      const parts = model.split('/');
      return parts[0]; // Get just the provider name (e.g., "google" from "google/gemini-2.5-pro")
    };
  
    // Combine all normalized items from all LLMs with their source
    const allItems = [];
    
    Object.entries(normalizedResults).forEach(([model, result]) => {
      const provider = getProviderName(model);
      
      result.items.forEach(item => {
        if (item && item.trim()) {
          allItems.push({
            item: item.trim(),
            provider
          });
        }
      });
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
    
    // Sort items by frequency (descending) and select top N
    const sortedItems = Object.entries(frequencyMap)
      .map(([item, { count, providers }]) => ({
        item,
        frequency: count,
        providers: Array.from(providers).sort()
      }))
      .sort((a, b) => {
        // Primary sort by frequency
        const freqDiff = b.frequency - a.frequency;
        if (freqDiff !== 0) return freqDiff;
        
        // Secondary sort by number of providers (more providers is better)
        const providerDiff = b.providers.length - a.providers.length;
        if (providerDiff !== 0) return providerDiff;
        
        // Tertiary sort alphabetically
        return a.item.localeCompare(b.item);
      })
      .slice(0, shortListCount);
    
    // Add rank and return
    return sortedItems.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));
  };