import React from 'react';

function RawResultsTable({ normalizedResults }) {
  // Extract provider names from model strings
  const getProviderName = (model) => {
    const parts = model.split('/');
    return parts[0]; // Get just the provider name
  };

  // Get all models
  const models = Object.keys(normalizedResults);
  
  // Find the maximum number of items across all models
  const maxItems = Math.max(
    ...models.map(model => normalizedResults[model].items.length)
  );
  
  return (
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
                const item = normalizedResults[model].items[rowIndex];
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
  );
}

export default RawResultsTable;