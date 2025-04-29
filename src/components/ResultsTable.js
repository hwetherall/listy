import React, { useState } from 'react';
import RawResultsTable from './RawResultsTable';
import TabView from './TabView';

// CategoryTable component for displaying a table of results for a specific category
function CategoryTable({ results, maxFrequency }) {
  if (!results || results.length === 0) {
    return (
      <div className="empty-category-message">
        No results available for this category.
      </div>
    );
  }

  return (
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
          {results.map((row, index) => (
            <tr key={row.rank || index + 1}>
              <td>{row.rank || index + 1}</td>
              <td>
                <div className="item-cell">
                  <span className="item-name">{row.item}</span>
                  {(row.rank <= 3 || index < 3) && (
                    <span className={`rank-badge rank-${row.rank || index + 1}`}>
                      {(row.rank === 1 || index === 0) && '🥇'}
                      {(row.rank === 2 || index === 1) && '🥈'}
                      {(row.rank === 3 || index === 2) && '🥉'}
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
                        width: `${(row.frequency / maxFrequency) * 100}%`,
                        opacity: 0.6 + 0.4 * (row.frequency / maxFrequency)
                      }}
                    />
                  </div>
                </div>
              </td>
              <td>
                <div className="provider-tags">
                  {row.providers && row.providers.map(provider => (
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
  );
}

function ResultsTable({ 
  categorizedResults, 
  normalizedRawResults,
  categoryInfo = {
    incumbent: { label: 'Incumbents', icon: '🏢', shortListCount: 10 },
    regional: { label: 'Regional Players', icon: '🌎', shortListCount: 5 },
    interesting: { label: 'Interesting Cases', icon: '💡', shortListCount: 3 },
    graveyard: { label: 'Graveyard', icon: '⚰️', shortListCount: 3 }
  }
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  const [activeCategory, setActiveCategory] = useState('incumbent');
  
  // Category icons and styling
  const categories = {
    incumbent: { 
      label: categoryInfo.incumbent?.label || 'Incumbents', 
      icon: categoryInfo.incumbent?.icon || '🏢', 
      count: Array.isArray(categorizedResults.incumbent) ? categorizedResults.incumbent.length : 0,
      shortListCount: categoryInfo.incumbent?.shortListCount || 10
    },
    regional: { 
      label: categoryInfo.regional?.label || 'Regional Players', 
      icon: categoryInfo.regional?.icon || '🌎', 
      count: Array.isArray(categorizedResults.regional) ? categorizedResults.regional.length : 0,
      shortListCount: categoryInfo.regional?.shortListCount || 5
    },
    interesting: { 
      label: categoryInfo.interesting?.label || 'Interesting Cases', 
      icon: categoryInfo.interesting?.icon || '💡', 
      count: Array.isArray(categorizedResults.interesting) ? categorizedResults.interesting.length : 0,
      shortListCount: categoryInfo.interesting?.shortListCount || 3
    },
    graveyard: { 
      label: categoryInfo.graveyard?.label || 'Graveyard', 
      icon: categoryInfo.graveyard?.icon || '⚰️', 
      count: Array.isArray(categorizedResults.graveyard) ? categorizedResults.graveyard.length : 0,
      shortListCount: categoryInfo.graveyard?.shortListCount || 3
    }
  };

  // Calculate max frequency for each category
  const maxFrequencies = {
    incumbent: Array.isArray(categorizedResults.incumbent) && categorizedResults.incumbent.length > 0 
      ? categorizedResults.incumbent[0].frequency : 1,
    regional: Array.isArray(categorizedResults.regional) && categorizedResults.regional.length > 0 
      ? categorizedResults.regional[0].frequency : 1,
    interesting: Array.isArray(categorizedResults.interesting) && categorizedResults.interesting.length > 0 
      ? categorizedResults.interesting[0].frequency : 1,
    graveyard: Array.isArray(categorizedResults.graveyard) && categorizedResults.graveyard.length > 0 
      ? categorizedResults.graveyard[0].frequency : 1
  };

  // Get model response times from results if available
  const modelResponseTimes = normalizedRawResults ? normalizedRawResults : {};

  const handleCopyToClipboard = (category) => {
    // Get the active category results
    const results = categorizedResults[category];
    if (!results || results.length === 0) {
      return;
    }

    // Format the results as a simple text list
    const text = results.map(item => `${item.rank || ''} ${item.item} (${item.frequency})`).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
      });
  };

  // Handle tab change
  const handleTabChange = (category) => {
    setActiveCategory(category);
  };

  // Get description based on category
  const getCategoryDescription = (category) => {
    switch(category) {
      case 'incumbent':
        return 'Established, large players that directly compete with the target company';
      case 'regional':
        return 'Companies that operate primarily in specific geographic regions';
      case 'interesting':
        return 'Innovative companies with novel business models or technologies';
      case 'graveyard':
        return 'Former competitors that are no longer active threats';
      default:
        return '';
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Competitor Analysis Results</h2>
      </div>
      
      <div className="category-tabs">
        {Object.entries(categories).map(([key, category]) => (
          Array.isArray(categorizedResults[key]) && categorizedResults[key].length > 0 && (
            <button 
              key={key}
              className={`category-tab-button ${activeCategory === key ? 'active' : ''}`}
              onClick={() => handleTabChange(key)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
              <span className="category-count">{category.count}</span>
            </button>
          )
        ))}
      </div>
      
      <div className="active-category-container">
        <div className="category-header">
          <h3>{categories[activeCategory]?.label || 'Results'}</h3>
          <p className="category-description">
            {getCategoryDescription(activeCategory)}
          </p>
        </div>
        
        <div className="results-actions">
          <button
            className={`copy-button ${copySuccess ? 'success' : ''}`}
            onClick={() => handleCopyToClipboard(activeCategory)}
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
        </div>
        
        {viewMode === 'summary' ? (
          <CategoryTable 
            results={categorizedResults[activeCategory]} 
            maxFrequency={maxFrequencies[activeCategory]} 
          />
        ) : (
          <div className="table-container detailed-table-container">
            <RawResultsTable 
              normalizedResults={normalizedRawResults[activeCategory] || {}} 
              category={activeCategory}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Additional styles for new UI components
const additionalStyles = `
.results-container {
  margin-top: var(--space-6);
}

.results-header {
  margin-bottom: var(--space-6);
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--neutral-200);
  padding-bottom: var(--space-2);
}

.category-tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--neutral-100);
  border: 1px solid var(--neutral-200);
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab-button:hover {
  background-color: var(--neutral-200);
}

.category-tab-button.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.category-icon {
  font-size: 1.2rem;
}

.category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: var(--neutral-200);
  font-size: 0.8rem;
  font-weight: 600;
}

.category-tab-button.active .category-count {
  background-color: white;
  color: var(--primary);
}

.active-category-container {
  background-color: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.category-header {
  margin-bottom: var(--space-4);
}

.category-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.category-description {
  color: var(--neutral-600);
  margin-top: var(--space-1);
  margin-bottom: 0;
}

.results-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.empty-category-message {
  padding: var(--space-6);
  text-align: center;
  color: var(--neutral-600);
  font-style: italic;
}

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

.view-toggle-container {
  display: flex;
}

.view-toggle-button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--neutral-300);
  background-color: var(--neutral-100);
  cursor: pointer;
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