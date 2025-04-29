import React, { useState } from 'react';

const ReportResultsTable = ({ results, stats, onUpdateResults }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [localResults, setLocalResults] = useState(results || []);
  
  if (!localResults || localResults.length === 0) {
    return (
      <div className="empty-report-message">
        <p>No report results available. Please run the Pre-Process Report first.</p>
      </div>
    );
  }

  // Group results by type for better organization
  const groupedResults = localResults.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  // Order of categories to display
  const categoryOrder = ['Incumbent', 'Regional', 'Interesting', 'Graveyard'];
  
  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    // Format as a table with tabs between columns
    const text = localResults.map(item => 
      `${item.company}\t${item.type}\t${item.description}`
    ).join('\n');
    
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

  // Handle removing a company
  const handleRemoveCompany = (company, type) => {
    const updatedResults = localResults.filter(
      item => !(item.company === company && item.type === type)
    );
    setLocalResults(updatedResults);
    
    // Notify parent component if provided
    if (onUpdateResults) {
      onUpdateResults(updatedResults);
    }
  };
  
  // Icons for different types
  const typeIcons = {
    'Incumbent': '🏢',
    'Regional': '🌎',
    'Interesting': '💡',
    'Graveyard': '⚰️'
  };

  return (
    <div className="report-results-container">
      <div className="report-header">
        <h2>Report Results</h2>
        <p className="report-subtitle">
          AI-generated company summaries. You can remove any companies you don't want to include.
        </p>
      </div>
      
      {stats && (
        <div className="report-stats">
          <div className="report-stats-grid">
            {Object.entries(stats).map(([category, data]) => (
              <div key={category} className="report-stat-card">
                <div className="stat-header">
                  <span className="stat-icon">
                    {category === 'incumbent' ? '🏢' : 
                     category === 'regional' ? '🌎' : 
                     category === 'interesting' ? '💡' : '⚰️'}
                  </span>
                  <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                </div>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-value">{data.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{data.valid}</span>
                    <span className="stat-label">Selected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
      
      {categoryOrder.map(type => {
        if (!groupedResults[type] || groupedResults[type].length === 0) return null;
        
        return (
          <div key={type} className="report-section">
            <div className="report-section-header">
              <span className="section-icon">{typeIcons[type]}</span>
              <h3 className="section-title">{type} Companies</h3>
              <span className="section-count">{groupedResults[type].length}</span>
            </div>
            
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Description</th>
                    <th className="action-column">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedResults[type].map((item, index) => (
                    <tr key={`${item.company}-${index}`}>
                      <td className="company-cell">
                        <span className="company-name">{item.company}</span>
                      </td>
                      <td className="description-cell">
                        <p className="company-description">{item.description}</p>
                      </td>
                      <td className="action-cell">
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveCompany(item.company, item.type)}
                          title="Remove this company"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportResultsTable; 