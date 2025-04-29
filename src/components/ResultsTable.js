import React, { useState } from 'react';
import RawResultsTable from './RawResultsTable';
import TabView from './TabView';

// New component to display model response times
function ModelResponseTimes({ responseTimes }) {
  if (!responseTimes || Object.keys(responseTimes).length === 0) {
    return null;
  }

  // Flatten the nested structure to get all response times
  const allResponseTimes = {};
  
  // Process each category
  Object.values(responseTimes).forEach(categoryData => {
    // Process each model in the category
    Object.entries(categoryData).forEach(([model, modelData]) => {
      if (modelData && modelData.responseTime) {
        allResponseTimes[model] = modelData.responseTime;
      }
    });
  });
  
  if (Object.keys(allResponseTimes).length === 0) {
    return null;
  }

  // Sort models by response time (fastest first)
  const sortedModels = Object.entries(allResponseTimes)
    .sort(([, timeA], [, timeB]) => parseFloat(timeA) - parseFloat(timeB));

  // Helper function to get provider name from model
  const getProviderName = (model) => {
    if (!model) return '';
    const parts = model.split('/');
    return parts[0]; // Get just the provider name
  };

  return (
    <div className="response-times-section">
      <h3>Model Response Times (Fastest to Slowest)</h3>
      <div className="response-times-grid">
        {sortedModels.map(([model, time]) => (
          <div key={model} className="response-time-item">
            <div className="provider-badge">{getProviderName(model)}</div>
            <span className="model-name">{model}</span>
            <span className="time-badge">{time}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsTable({ 
  categorizedResults, 
  normalizedRawResults,
  categoryInfo
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  
  // Category icons and styling
  const categories = {
    incumbent: { 
      label: 'Incumbents', 
      icon: '🏢', 
      count: categorizedResults.incumbent?.length || 0,
      shortListCount: 10
    },
    regional: { 
      label: 'Regional Players', 
      icon: '🌎', 
      count: categorizedResults.regional?.length || 0,
      shortListCount: 5
    },
    interesting: { 
      label: 'Interesting Cases', 
      icon: '💡', 
      count: categorizedResults.interesting?.length || 0,
      shortListCount: 3
    },
    graveyard: { 
      label: 'Graveyard', 
      icon: '⚰️', 
      count: categorizedResults.graveyard?.length || 0,
      shortListCount: 3
    }
  };

  // Get model response times from results if available
  const modelResponseTimes = normalizedRawResults ? 
    Object.entries(normalizedRawResults)
      .reduce((acc, [model, data]) => {
        if (data.responseTime) {
          acc[model] = data.responseTime;
        }
        return acc;
      }, {}) 
    : {};

  const handleCopyToClipboard = (category) => {
    // Implementation to copy the current category's data to clipboard
    // ...similar to the existing implementation
  };

  return (
    <div className="results-container">
      <TabView categories={categories}>
        {/* Incumbent Tab */}
        <div className="category-tab incumbent-tab">
          <div className="category-header">
            <h2>Incumbent Competitors</h2>
            <p className="category-description">
              Established, large players that directly compete with the target company
            </p>
          </div>
          
          {/* View toggle and other controls... */}
          
          {/* Table for incumbent competitors */}
          <div className="table-container summary-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Competitor</th>
                  <th>Frequency</th>
                  <th>LLM Sources</th>
                </tr>
              </thead>
              <tbody>
                {categorizedResults.incumbent?.map((row) => (
                  <tr key={row.rank}>
                    <td>{row.rank}</td>
                    <td>
                      <div className="item-cell">
                        <span className="item-name">{row.item}</span>
                        {row.rank <= 3 && (
                          <span className={`rank-badge rank-${row.rank}`}>
                            {row.rank === 1 && '🥇'}
                            {row.rank === 2 && '🥈'}
                            {row.rank === 3 && '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="frequency-cell">
                        <span className="frequency-value">{row.frequency}</span>
                        <div className="frequency-bar-container">
                          <div 
                            className="frequency-bar"
                            style={{ 
                              width: `${(row.frequency / categorizedResults.incumbent[0].frequency) * 100}%`,
                              opacity: 0.6 + 0.4 * (row.frequency / categorizedResults.incumbent[0].frequency)
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="provider-tags">
                        {row.providers.map(provider => (
                          <span key={provider} className={`provider-tag ${provider}`}>
                            {provider}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Tab */}
        <div className="category-tab regional-tab">
          {/* Similar structure as above but for regional competitors */}
        </div>

        {/* Interesting Tab */}
        <div className="category-tab interesting-tab">
          {/* Similar structure as above but for interesting competitors */}
        </div>

        {/* Graveyard Tab */}
        <div className="category-tab graveyard-tab">
          {/* Similar structure as above but for graveyard competitors */}
        </div>
      </TabView>
      
      {/* Display response times section if we have any */}
      {Object.keys(modelResponseTimes).length > 0 && (
        <ModelResponseTimes responseTimes={modelResponseTimes} />
      )}
      
      <div className="view-toggle-container">
        <button 
          className={`view-toggle-button ${viewMode === 'summary' ? 'active' : ''}`}
          onClick={() => setViewMode('summary')}
        >
          Summary View
        </button>
        <button 
          className={`view-toggle-button ${viewMode === 'detailed' ? 'active' : ''}`}
          onClick={() => setViewMode('detailed')}
        >
          Detailed View
        </button>
      </div>
      
      <div className="results-actions">
        <button
          className={`copy-button ${copySuccess ? 'success' : ''}`}
          onClick={() => handleCopyToClipboard('incumbent')}
        >
          {copySuccess ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied to clipboard!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy to clipboard
            </>
          )}
        </button>
      </div>
      
      {viewMode === 'summary' ? (
        <div className="table-container summary-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Competitor</th>
                <th>Frequency</th>
                <th>LLM Sources</th>
              </tr>
            </thead>
            <tbody>
              {categorizedResults.incumbent?.map((row) => (
                <tr key={row.rank}>
                  <td>{row.rank}</td>
                  <td>
                    <div className="item-cell">
                      <span className="item-name">{row.item}</span>
                      {row.rank <= 3 && (
                        <span className={`rank-badge rank-${row.rank}`}>
                          {row.rank === 1 && '🥇'}
                          {row.rank === 2 && '🥈'}
                          {row.rank === 3 && '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="frequency-cell">
                      <span className="frequency-value">{row.frequency}</span>
                      <div className="frequency-bar-container">
                        <div 
                          className="frequency-bar"
                          style={{ 
                            width: `${(row.frequency / categorizedResults.incumbent[0].frequency) * 100}%`,
                            opacity: 0.6 + 0.4 * (row.frequency / categorizedResults.incumbent[0].frequency)
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="provider-tags">
                      {row.providers.map(provider => (
                        <span key={provider} className={`provider-tag ${provider}`}>
                          {provider}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container detailed-table-container">
          <RawResultsTable normalizedResults={normalizedRawResults} />
        </div>
      )}
    </div>
  );
}

// Add these styles to your main.css
const additionalStyles = `
.results-subtitle {
  color: var(--neutral-600);
  margin-top: -0.5rem;
  margin-bottom: 0;
}

.results-meta {
  display: flex;
  gap: var(--space-6);
  align-items: center;
}

.results-stats {
  display: flex;
  gap: var(--space-4);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--neutral-100);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--neutral-600);
}

.response-times-section {
  margin: var(--space-6) 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--neutral-50);
  border: 1px solid var(--neutral-200);
}

.response-times-section h3 {
  margin-top: 0;
  margin-bottom: var(--space-4);
  font-size: 1.1rem;
  color: var(--neutral-800);
}

.response-times-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-3);
}

.response-time-item {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: white;
  border: 1px solid var(--neutral-200);
  position: relative;
}

.provider-badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--primary-100);
  color: var(--primary-700);
  font-size: 0.75rem;
  font-weight: 600;
}

.model-name {
  font-size: 0.9rem;
  margin-bottom: var(--space-2);
  color: var(--neutral-700);
  padding-right: 60px; /* Make room for the provider badge */
}

.time-badge {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
  margin-top: auto;
}

/* Add these if needed */
.view-toggle-container {
  display: flex;
  margin-bottom: var(--space-4);
}

.view-toggle-button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--neutral-300);
  background-color: var(--neutral-100);
  cursor: pointer;
  flex: 1;
  text-align: center;
}

.view-toggle-button.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.view-toggle-button:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.view-toggle-button:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
`;

export default ResultsTable;