import React from 'react';

function PreviousCompanies({ companies }) {
  if (!companies || companies.length === 0) {
    return null;
  }
  
  // Calculate averages for precision and recall
  const calculateAverages = () => {
    if (companies.length === 0) return { precision: 0, recall: 0 };
    
    let precisionTotal = 0;
    let recallTotal = 0;
    let validCompaniesCount = 0;
    
    companies.forEach(company => {
      if (company.metrics) {
        const precisionStr = company.metrics.precision;
        const recallStr = company.metrics.recall;
        
        if (precisionStr !== 'N/A' && recallStr !== 'N/A') {
          // Remove % symbol and convert to number
          const precisionVal = parseFloat(precisionStr);
          const recallVal = parseFloat(recallStr);
          
          if (!isNaN(precisionVal)) precisionTotal += precisionVal;
          if (!isNaN(recallVal)) recallTotal += recallVal;
          validCompaniesCount++;
        }
      }
    });
    
    return {
      precision: validCompaniesCount > 0 ? `${(precisionTotal / validCompaniesCount).toFixed(1)}%` : "0.0%",
      recall: validCompaniesCount > 0 ? `${(recallTotal / validCompaniesCount).toFixed(1)}%` : "0.0%" 
    };
  };
  
  const averages = calculateAverages();
  
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
          {companies.map((company, index) => {
            // Debug log to see the metrics object for each company
            // console.log(`Rendering metrics for ${company.name}:`, company.metrics);
            
            // Explicitly get the recall value
            const recallValue = company.metrics.recall;

            return (
              <tr key={index} className="previous-company-row">
                <td><strong>{company.name}</strong></td>
                <td>{company.description.substring(0, 50)}{company.description.length > 50 ? '...' : ''}</td>
                <td>{company.testMode ? 'Test' : 'Standard'}</td>
                <td>{company.metrics.precision}</td>
                <td>{recallValue}</td>
                <td>{company.timestamp}</td>
              </tr>
            );
          })}
          <tr className="averages-row" style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
            <td colSpan={3}><strong>AVERAGES</strong></td>
            <td>{averages.precision}</td>
            <td>{averages.recall}</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PreviousCompanies;