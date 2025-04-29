import React, { useState } from 'react';

function RawResultsTable({ normalizedResults }) {
  const [selectedCategory, setSelectedCategory] = useState('incumbent');

  // Check if normalizedResults has the expected structure
  if (!normalizedResults || !normalizedResults[selectedCategory]) {
    return <div>No data available</div>;
  }

  // Extract provider names from model strings
  const getProviderName = (model) => {
    const parts = model.split('/');
    return parts[0]; // Get just the provider name
  };

  // Get all models for the selected category
  const categoryData = normalizedResults[selectedCategory];
  const models = Object.keys(categoryData);
  
  // Find the maximum number of items across all models in this category
  const maxItems = models.length > 0 
    ? Math.max(...models.map(model => 
        categoryData[model] && categoryData[model].items 
          ? categoryData[model].items.length 
          : 0
      ))
    : 0;
  
  return (
    <div className="raw-results-container">
      <div className="category-selector">
        <label htmlFor="category-select">Select Category: </label>
        <select 
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {Object.keys(normalizedResults).map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {models.length > 0 ? (
        <div className="raw-results-table-container">
          <table className="raw-results-table">
            <thead>
              <tr>
                {models.map(model => (
                  <th key={model}>{getProviderName(model)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxItems }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {models.map(model => {
                    const modelData = categoryData[model];
                    const item = modelData && modelData.items && modelData.items[rowIndex];
                    return (
                      <td key={`${model}-${rowIndex}`} className={item ? '' : 'empty-cell'}>
                        {item || ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No models available for this category</div>
      )}
    </div>
  );
}

export default RawResultsTable;