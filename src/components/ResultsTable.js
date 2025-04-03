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
      <h2>Final Results</h2>
      <p>Top {results.length} most frequent items across all LLMs</p>
      
      <div className="results-actions">
        <button
          className={`copy-button ${copySuccess ? 'success' : ''}`}
          onClick={handleCopyToClipboard}
        >
          {copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      
      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Item</th>
              <th>Frequency</th>
              <th>LLMs</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.rank}>
                <td>{row.rank}</td>
                <td>{row.item}</td>
                <td>{row.frequency}</td>
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

export default ResultsTable;