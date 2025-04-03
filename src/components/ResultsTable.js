import React, { useState } from 'react';

function ResultsTable({ results }) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle copying table to clipboard
  const handleCopyToClipboard = () => {
    // Create a string representation of the table for spreadsheets
    const headers = ["Rank", "Item", "Frequency", "LLMs"];
    const rows = results.map(row => [
      row.rank,
      row.item,
      row.frequency,
      row.providers.join(', ')
    ]);
    
    // Convert to TSV (tab-separated values) for easy pasting into spreadsheets
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');
    
    navigator.clipboard.writeText(tsvContent)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div>
          <h2>Final Results</h2>
          <p className="results-subtitle">
            Top {results.length} most frequent items across all LLMs
          </p>
        </div>
        
        <div className="results-meta">
          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-value">{results.length}</span>
              <span className="stat-label">Items</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {results.reduce((max, item) => Math.max(max, item.frequency), 0)}
              </span>
              <span className="stat-label">Max Frequency</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="results-actions">
        <button
          className={`copy-button ${copySuccess ? 'success' : ''}`}
          onClick={handleCopyToClipboard}
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
      
      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Item</th>
              <th>Frequency</th>
              <th>LLM Sources</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
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
                          width: `${(row.frequency / results[0].frequency) * 100}%`,
                          opacity: 0.6 + 0.4 * (row.frequency / results[0].frequency)
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

.item-cell {
  display: flex;
  align-items: center;
}

.item-name {
  flex: 1;
}

.rank-badge {
  margin-left: var(--space-2);
  font-size: 1.25rem;
}

.frequency-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.frequency-value {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: var(--space-1);
}

.frequency-bar-container {
  width: 100%;
  height: 4px;
  background-color: var(--neutral-200);
  border-radius: 2px;
  overflow: hidden;
}

.frequency-bar {
  height: 100%;
  background: linear-gradient(to right, var(--primary), var(--secondary));
}
`;

export default ResultsTable;