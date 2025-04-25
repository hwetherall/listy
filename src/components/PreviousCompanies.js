import React from 'react';

function PreviousCompanies({ companies }) {
  if (!companies || companies.length === 0) {
    return null;
  }
  
  return (
    <div className="previous-companies">
      <h3>Previous Companies</h3>
      <table className="previous-companies-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Description</th>
            <th>Mode</th>
            <th>Precision</th>
            <th>Recall</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company, index) => (
            <tr key={index} className="previous-company-row">
              <td><strong>{company.name}</strong></td>
              <td>{company.description.substring(0, 50)}{company.description.length > 50 ? '...' : ''}</td>
              <td>{company.testMode ? 'Test' : 'Standard'}</td>
              <td>{company.metrics.precision}</td>
              <td>{company.metrics.recall}</td>
              <td>{company.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PreviousCompanies;