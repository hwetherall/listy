import React, { useState } from 'react';

function RawResultsTable({ normalizedResults, category = 'incumbent' }) {
  const [selectedCategory, setSelectedCategory] = useState(category);

  // Check if normalizedResults has the expected structure
  if (!normalizedResults || Object.keys(normalizedResults).length === 0) {
    return <div className="empty-data-message">No raw data available</div>;
  }

  // Extract provider names from model strings
  const getProviderName = (model) => {
    const parts = model.split('/');
    return parts[0]; // Get just the provider name
  };

  // Get models for the selected category
  const models = Object.keys(normalizedResults);
  
  // Find the maximum number of items across all models
  const maxItems = models.length > 0 
    ? Math.max(...models.map(model => 
        normalizedResults[model] && normalizedResults[model].items 
          ? normalizedResults[model].items.length 
          : 0
      ))
    : 0;
  
  return (
    <div className="raw-results-container">
      {models.length > 0 ? (
        <div className="raw-results-table-container">
          <table className="raw-results-table">
            <thead>
              <tr>
                <th className="index-column">#</th>
                {models.map(model => (
                  <th key={model}>
                    <div className="model-header">
                      <span className="provider-name">{getProviderName(model)}</span>
                      <span className="model-name">{model.split('/')[1]?.split(':')[0] || ''}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxItems }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="index-column">{rowIndex + 1}</td>
                  {models.map(model => {
                    const modelData = normalizedResults[model];
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
        <div className="no-models-message">No raw data available for this category</div>
      )}
    </div>
  );
}

export default RawResultsTable;