import React, { useState, useEffect } from 'react';

function ControlSetEvaluation({ controlSet, normalizedResults }) {
  const [evaluationResults, setEvaluationResults] = useState({
    shortList: [],
    longList: [],
    notFound: []
  });
  const [metrics, setMetrics] = useState({
    shortListCount: 0,
    longListCount: 0,
    notFoundCount: 0,
    precision: 0,
    recall: 0
  });

  useEffect(() => {
    if (controlSet && normalizedResults) {
      evaluateResults();
    }
  }, [controlSet, normalizedResults]);

  const evaluateResults = () => {
    if (!controlSet || !normalizedResults) return;

    const { summary, rawData, normalizedControlSet } = normalizedResults;
    
    // Use normalized control set if available
    const controlSetToUse = normalizedControlSet || controlSet;
    
    // Extract all normalized competitors from all LLM results
    const allCompetitorsInLongList = new Set();
    Object.values(rawData).forEach(model => {
      model.items.forEach(item => {
        if (item) allCompetitorsInLongList.add(item.trim());
      });
    });
    
    // Extract short list competitors
    const shortListCompetitors = new Set(
      summary.map(item => item.item)
    );
    
    // Categorize competitors
    const shortList = [];
    const longList = [];
    const notFound = [];
    
    // Evaluate each competitor in control set
    controlSetToUse.competitors.forEach((competitor, index) => {
      // Include both original and normalized name if they differ
      const originalCompetitor = controlSetToUse.originalCompetitors 
        ? controlSetToUse.originalCompetitors[index]
        : competitor;
      
      const isNormalized = originalCompetitor !== competitor;
      const item = {
        competitor,
        originalCompetitor,
        isNormalized
      };
      
      if (shortListCompetitors.has(competitor)) {
        shortList.push(item);
      } else if (allCompetitorsInLongList.has(competitor)) {
        longList.push(item);
      } else {
        notFound.push(item);
      }
    });
    
    setEvaluationResults({
      shortList,
      longList,
      notFound
    });
    
    // Calculate metrics
    const shortListCount = shortList.length;
    const longListCount = longList.length;
    const notFoundCount = notFound.length;
    
    const precision = shortListCount / summary.length;
    const recall = (shortListCount + longListCount) / controlSetToUse.competitors.length;
    
    setMetrics({
      shortListCount,
      longListCount,
      notFoundCount,
      precision: Math.round(precision * 100) + '%',
      recall: Math.round(recall * 100) + '%'
    });
  };

  if (!controlSet || !normalizedResults) {
    return null;
  }

  return (
    <div className="evaluation-container">
      <h3>Evaluation Results</h3>
      <div className="evaluation-metrics">
        <div className="metric-card">
          <h4>Precision</h4>
          <div className="metric-value">{metrics.precision}</div>
          <div className="metric-desc">% of short list matching control set</div>
        </div>
        <div className="metric-card">
          <h4>Recall</h4>
          <div className="metric-value">{metrics.recall}</div>
          <div className="metric-desc">% of control set found in any list</div>
        </div>
        <div className="metric-card">
          <h4>Coverage</h4>
          <div className="metric-distribution">
            <div 
              className="distribution-bar short-list"
              style={{ width: `${(metrics.shortListCount / controlSet.competitors.length) * 100}%` }}
            ></div>
            <div 
              className="distribution-bar long-list"
              style={{ width: `${(metrics.longListCount / controlSet.competitors.length) * 100}%` }}
            ></div>
            <div 
              className="distribution-bar not-found"
              style={{ width: `${(metrics.notFoundCount / controlSet.competitors.length) * 100}%` }}
            ></div>
          </div>
          <div className="distribution-legend">
            <div className="legend-item"><span className="legend-color short-list"></span> Short List</div>
            <div className="legend-item"><span className="legend-color long-list"></span> Long List</div>
            <div className="legend-item"><span className="legend-color not-found"></span> Not Found</div>
          </div>
        </div>
      </div>
      
      <div className="evaluation-columns">
        <div className="evaluation-column">
          <h4 className="column-header short-list">In the Short List ({evaluationResults.shortList.length})</h4>
          <ul className="competitor-list">
            {evaluationResults.shortList.map((item, index) => (
              <li key={`short-${index}`} className="competitor-item">
                {item.competitor}
                {item.isNormalized && (
                  <span className="normalization-note">
                    (normalized from "{item.originalCompetitor}")
                  </span>
                )}
              </li>
            ))}
            {evaluationResults.shortList.length === 0 && (
              <li className="empty-message">No competitors in short list</li>
            )}
          </ul>
        </div>
        
        <div className="evaluation-column">
          <h4 className="column-header long-list">In the Long List ({evaluationResults.longList.length})</h4>
          <ul className="competitor-list">
            {evaluationResults.longList.map((item, index) => (
              <li key={`long-${index}`} className="competitor-item">
                {item.competitor}
                {item.isNormalized && (
                  <span className="normalization-note">
                    (normalized from "{item.originalCompetitor}")
                  </span>
                )}
              </li>
            ))}
            {evaluationResults.longList.length === 0 && (
              <li className="empty-message">No competitors in long list</li>
            )}
          </ul>
        </div>
        
        <div className="evaluation-column">
          <h4 className="column-header not-found">Not on the List ({evaluationResults.notFound.length})</h4>
          <ul className="competitor-list">
            {evaluationResults.notFound.map((item, index) => (
              <li key={`not-${index}`} className="competitor-item">
                {item.competitor}
                {item.isNormalized && (
                  <span className="normalization-note">
                    (normalized from "{item.originalCompetitor}")
                  </span>
                )}
              </li>
            ))}
            {evaluationResults.notFound.length === 0 && (
              <li className="empty-message">All competitors were found</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ControlSetEvaluation;