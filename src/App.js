import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import LoadingIndicator from './components/LoadingIndicator';
import ResultsTable from './components/ResultsTable';
import ErrorDisplay from './components/ErrorDisplay';
import ControlSetEvaluation from './components/ControlSetEvaluation';
import { queryLLMs, LLM_MODELS } from './services/llmService';
import { normalizeResults } from './services/normalizationService';
import { processResults } from './utils/resultProcessor';
import './styles/main.css';
import PreviousCompanies from './components/PreviousCompanies';

function App() {
  // State management
  const [input, setInput] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [longListCount, setLongListCount] = useState(20);
  const [shortListCount, setShortListCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResults, setRawResults] = useState(null);
  const [normalizedResults, setNormalizedResults] = useState(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [progress, setProgress] = useState({});
  const [fastMode, setFastMode] = useState(true); // Default to fast mode
  const [controlSet, setControlSet] = useState(null);
  const [testMode, setTestMode] = useState(false); // New test mode state
  const [previousCompanies, setPreviousCompanies] = useState([]);
  const [selectedModels, setSelectedModels] = useState([...LLM_MODELS]); // Initialize with all models
  const [showModelMetrics, setShowModelMetrics] = useState(false);
  const [llmMetrics, setLlmMetrics] = useState({});
  
  // State for model selection in the metrics panel
  const [metricsModelSelection, setMetricsModelSelection] = useState({});
  const [recalculatedResults, setRecalculatedResults] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Add new state in App.js
  const [categorizedResults, setCategorizedResults] = useState({
    incumbent: [],
    regional: [],
    interesting: [],
    graveyard: []
  });

  // Effect to update list counts when control set changes and test mode is active
  useEffect(() => {
    if (testMode && controlSet && controlSet.competitors && controlSet.competitors.length > 0) {
      const competitorCount = controlSet.competitors.length;
      setShortListCount(competitorCount);
      setLongListCount(Math.ceil(competitorCount * 1.5)); // 50% more
    } else if (testMode && (!controlSet || !controlSet.competitors || controlSet.competitors.length === 0)) {
      // Reset to default values if there are no competitors in test mode
      setShortListCount(10);
      setLongListCount(20);
    }
  }, [controlSet, testMode]);

  // Initialize metrics model selection when llmMetrics changes
  useEffect(() => {
    if (Object.keys(llmMetrics).length > 0) {
      const initialSelections = {};
      Object.keys(llmMetrics).forEach(model => {
        initialSelections[model] = true; // Default all to selected
      });
      setMetricsModelSelection(initialSelections);
      setRecalculatedResults(null); // Reset recalculated results when raw metrics change
    }
  }, [llmMetrics]);

  // Submit handler - Query all LLMs
  const handleSubmit = async (controlSetData) => {
    setIsLoading(true);
    setError(null);
    setRawResults(null);
    setNormalizedResults(null);
    setProgress({});
    setLlmMetrics({});
    setRecalculatedResults(null);
    
    // Update control set if provided from the form
    if (controlSetData) {
      setControlSet(controlSetData);
    }
    
    try {
      const results = await queryLLMs(
        input, 
        companyDescription,
        longListCount, 
        (model, status, responseTime) => {
          setProgress(prev => ({
            ...prev,
            [model]: {
              status,
              responseTime
            }
          }));
        },
        fastMode, // Pass fastMode to the query function
        selectedModels // Pass the selected models to the query function
      );
      setRawResults(results);
    } catch (err) {
      setError(err.message || 'An error occurred while querying LLMs');
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize handler - Process results
  const handleNormalize = async () => {
    if (!rawResults) return;
    
    setIsNormalizing(true);
    setError(null);
    
    try {
      // First normalize all results together to identify duplicates across categories
      const normalizedData = await normalizeResults(rawResults);

      // Process each category with different limits
      const processedIncumbent = processResults(normalizedData.incumbent, shortListCount);
      const processedRegional = processResults(normalizedData.regional, 5); // Max 5 for regional
      const processedInteresting = processResults(normalizedData.interesting, 3); // Max 3 for interesting
      const processedGraveyard = processResults(normalizedData.graveyard, 3); // Max 3 for graveyard

      // Set the categorized results
      setCategorizedResults({
        incumbent: processedIncumbent.items || processedIncumbent,
        regional: processedRegional.items || processedRegional,
        interesting: processedInteresting.items || processedInteresting,
        graveyard: processedGraveyard.items || processedGraveyard
      });

      // Store the raw normalized data per category for potential detailed view or recalculation
      const rawNormalizedCategorizedData = {
        incumbent: normalizedData.incumbent,
        regional: normalizedData.regional,
        interesting: normalizedData.interesting,
        graveyard: normalizedData.graveyard,
      };

      // TODO: Re-evaluate how metrics (precision/recall) should be calculated with categorized results
      // For now, we'll just store the raw data and categorized results.
      // We might need a way to define the control set per category or have a global one.
      setLlmMetrics({}); // Reset metrics for now

      // Set normalized results (maybe rename this state later?)
      setNormalizedResults({
        // Keep summary pointing to incumbents for potential backward compatibility or default view
        summary: processedIncumbent.items || processedIncumbent,
        modelResponseTimes: processedIncumbent.modelResponseTimes || {}, // Or calculate across all?
        rawData: rawNormalizedCategorizedData, // Store the categorized raw data
        categorized: true // Flag to indicate we're using categorized results
        // normalizedControlSet: normalizedControlSet // Control set logic needs update
      });

    } catch (err) {
      setError(err.message || 'An error occurred during normalization');
    } finally {
      setIsNormalizing(false);
    }
  };

  // Recalculate results based on selected models
  const handleRecalculate = async () => {
    if (!normalizedResults || !Object.keys(metricsModelSelection).length) return;
    
    setIsRecalculating(true);
    
    try {
      // Filter out deselected models
      const filteredRawData = {};
      Object.keys(normalizedResults.rawData).forEach(model => {
        if (metricsModelSelection[model]) {
          filteredRawData[model] = normalizedResults.rawData[model];
        }
      });
      
      // Check if we have any models left after filtering
      if (Object.keys(filteredRawData).length === 0) {
        throw new Error('At least one model must be selected for recalculation');
      }
      
      // Process the filtered results
      const recalculatedProcessed = processResults(filteredRawData, shortListCount);

      // Calculate new metrics if in test mode with control set
      const recalculatedMetrics = {};
      
      if (testMode && normalizedResults.normalizedControlSet) {
        const normalizedControlSetCompetitors = new Set(normalizedResults.normalizedControlSet.competitors);
        
        // Calculate metrics for each model
        Object.entries(filteredRawData).forEach(([model, modelData]) => {
          if (!modelData || !modelData.items) return;
          
          const modelItems = new Set(modelData.items);
          let precisionMatches = 0;
          
          modelItems.forEach(item => {
            if (normalizedControlSetCompetitors.has(item)) {
              precisionMatches++;
            }
          });
          
          const precision = modelItems.size > 0 
            ? precisionMatches / modelItems.size
            : 0;
          
          let recallMatches = 0;
          
          normalizedControlSetCompetitors.forEach(controlItem => {
            if (modelItems.has(controlItem)) {
              recallMatches++;
            }
          });
          
          const recall = normalizedControlSetCompetitors.size > 0
            ? recallMatches / normalizedControlSetCompetitors.size
            : 0;
          
          recalculatedMetrics[model] = {
            precision: Math.round(precision * 100),
            recall: Math.round(recall * 100),
            itemCount: modelItems.size,
            responseTime: llmMetrics[model]?.responseTime || 0
          };
        });
        
        // Add overall metrics for the recalculated short list
        const shortListItems = new Set(recalculatedProcessed.items ? recalculatedProcessed.items.map(item => item.item) : recalculatedProcessed.map(item => item.item));
        let overallPrecisionMatches = 0;
        
        shortListItems.forEach(item => {
          if (normalizedControlSetCompetitors.has(item)) {
            overallPrecisionMatches++;
          }
        });
        
        const overallPrecision = shortListItems.size > 0
          ? overallPrecisionMatches / shortListItems.size
          : 0;
        
        let overallRecallMatches = 0;
        normalizedControlSetCompetitors.forEach(controlItem => {
          if (shortListItems.has(controlItem)) {
            overallRecallMatches++;
          }
        });
        
        const overallRecall = normalizedControlSetCompetitors.size > 0
          ? overallRecallMatches / normalizedControlSetCompetitors.size
          : 0;
        
        // Add summary metrics
        recalculatedMetrics['overall'] = {
          precision: Math.round(overallPrecision * 100),
          recall: Math.round(overallRecall * 100),
          selectedModels: Object.keys(filteredRawData).length
        };
      }

      setRecalculatedResults({
        summary: recalculatedProcessed.items || recalculatedProcessed,
        rawData: filteredRawData,
        metrics: recalculatedMetrics
      });
    } catch (err) {
      setError(err.message || 'An error occurred during recalculation');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle toggling a model in the metrics panel
  const handleMetricsModelToggle = (model) => {
    setMetricsModelSelection(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
    // Reset recalculated results when selection changes
    setRecalculatedResults(null);
  };

  // Select/deselect all models
  const handleSelectAllMetricsModels = (select) => {
    const newSelection = {};
    Object.keys(llmMetrics).forEach(model => {
      newSelection[model] = select;
    });
    setMetricsModelSelection(newSelection);
    setRecalculatedResults(null);
  };

  // Add a function to handle starting a new company
  const handleNewCompany = () => {
    // Only proceed if we have normalized results
    if (!normalizedResults || !input) return;

    // Extract precision and recall metrics if available
    let metrics = {
      precision: 'N/A',
      recall: 'N/A'
    };

    // If we're in test mode and have a control set, use the evaluation metrics
    if (testMode && controlSet && normalizedResults && normalizedResults.normalizedControlSet && controlSet.competitors.length > 0) {

      const originalControlSetCompetitors = new Set(controlSet.competitors);
      const normalizedControlSetCompetitors = new Set(normalizedResults.normalizedControlSet.competitors);

      // --- Precision Calculation (Checks normalized control set against short list) ---
      const shortListItems = new Set(normalizedResults.summary.map(item => item.item));
      let precisionMatches = 0;
      shortListItems.forEach(item => {
        if (normalizedControlSetCompetitors.has(item)) {
          precisionMatches++;
        }
      });
      // Ensure denominator is not zero
      const precision = normalizedResults.summary.length > 0
        ? precisionMatches / normalizedResults.summary.length
        : 0;

      // --- Recall Calculation (Checks normalized control set against *all* normalized found items) ---
      // Get all unique *normalized* items found by any LLM from rawData
      const allFoundNormalizedItems = new Set();
      Object.values(normalizedResults.rawData).forEach(modelResult => {
        if (modelResult && modelResult.items) {
          modelResult.items.forEach(item => {
            if (item) allFoundNormalizedItems.add(item.trim()); // These are already normalized
          });
        }
      });

      // Count how many *normalized* control set competitors are in the *all found normalized* items list
      let recallMatches = 0;
      normalizedControlSetCompetitors.forEach(normalizedControlCompetitor => {
        if (allFoundNormalizedItems.has(normalizedControlCompetitor)) {
          recallMatches++;
        }
      });

      // Recall = total matches found / total number of *original* control set items
      // Ensure denominator is not zero
      const recall = originalControlSetCompetitors.size > 0
         ? recallMatches / originalControlSetCompetitors.size
         : 0;

      // Format both metrics as percentages
      metrics = {
        precision: Math.round(precision * 100) + '%',
        recall: Math.round(recall * 100) + '%'
      };

      console.log('Debug metrics calculation (Final Logic):', {
        precisionMatches: precisionMatches,
        shortlistLength: normalizedResults.summary.length,
        recallMatches: recallMatches,
        originalControlSetLength: originalControlSetCompetitors.size,
        calculatedPrecision: precision,
        calculatedRecall: recall,
        formattedMetrics: metrics
      });
    }

    // Save current company data
    setPreviousCompanies(prev => [...prev, {
      name: input,
      description: companyDescription,
      timestamp: new Date().toLocaleString(),
      testMode,
      metrics // Use the calculated metrics
    }]);

    // Reset form for a new company
    setInput('');
    setCompanyDescription('');
    setRawResults(null);
    setNormalizedResults(null);
    setProgress({});
    setLlmMetrics({});
    setRecalculatedResults(null);

    // Reset control set for new company
    setControlSet(null);

    // Reset to default list counts
    if (!testMode) {
      setLongListCount(20);
      setShortListCount(10);
    }

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleModelMetrics = () => {
    setShowModelMetrics(!showModelMetrics);
  };

  // Count how many models are selected in the metrics panel
  const countSelectedMetricsModels = () => {
    return Object.values(metricsModelSelection).filter(Boolean).length;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Listy</h1>
        <p>Create short lists from long lists based on multiple LLMs</p>
      </header>
      
      <main>
      <InputForm
        input={input}
        setInput={setInput}
        companyDescription={companyDescription}
        setCompanyDescription={setCompanyDescription}
        longListCount={longListCount}
        setLongListCount={setLongListCount}
        shortListCount={shortListCount}
        setShortListCount={setShortListCount}
        fastMode={fastMode}
        setFastMode={setFastMode}
        testMode={testMode}
        setTestMode={setTestMode}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
        
        {isLoading && (
          <LoadingIndicator 
            message="Querying LLMs..." 
            progress={progress} 
          />
        )}
        
        {error && <ErrorDisplay message={error} />}
        
        {rawResults && !normalizedResults && (
          <div className="normalization-section">
            <div className="normalization-header">
              <div className="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
              <div className="normalization-text">
                <h2>Raw Results Collected</h2>
                <p>Data collected from {Object.keys(rawResults).length} LLMs. Click below to normalize and find the most common items.</p>
              </div>
            </div>
            
            <button 
              onClick={handleNormalize} 
              disabled={isNormalizing} 
              className="normalize-button"
            >
              {isNormalizing ? (
                <>
                  <span className="spinner-small"></span>
                  Normalizing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6z"></path>
                    <path d="M12 13v9"></path>
                    <path d="M5 13v9"></path>
                    <path d="M19 13v9"></path>
                  </svg>
                  Normalize Results
                </>
              )}
            </button>
            
            {isNormalizing && (
              <LoadingIndicator message="Normalizing results..." />
            )}
          </div>
        )}
        
        {normalizedResults && (
          <ResultsTable 
            categorizedResults={categorizedResults} 
            normalizedRawResults={normalizedResults.rawData} // Pass the categorized raw data
            categoryInfo={{
              incumbent: { label: 'Incumbents', icon: '🏢', shortListCount: shortListCount },
              regional: { label: 'Regional Players', icon: '🌎', shortListCount: 5 },
              interesting: { label: 'Interesting Cases', icon: '💡', shortListCount: 3 },
              graveyard: { label: 'Graveyard', icon: '⚰️', shortListCount: 3 }
            }}
          />
        )}

        {/* Recalculated Results */}
        {recalculatedResults && (
          <div className="recalculated-results-section">
            <h3 className="recalculated-results-header">
              Recalculated Results ({countSelectedMetricsModels()} Models)
            </h3>
            
            <div className="recalculated-metrics">
              {recalculatedResults.metrics && recalculatedResults.metrics.overall && (
                <div className="recalculated-metrics-summary">
                  <div className="recalculated-metric">
                    <span className="recalculated-metric-label">Precision:</span>
                    <span className="recalculated-metric-value">{recalculatedResults.metrics.overall.precision}%</span>
                  </div>
                  <div className="recalculated-metric">
                    <span className="recalculated-metric-label">Recall:</span>
                    <span className="recalculated-metric-value">{recalculatedResults.metrics.overall.recall}%</span>
                  </div>
                </div>
              )}
            </div>
            
            <ResultsTable 
              categorizedResults={recalculatedResults.categorizedSummary} // Need to update recalculation logic
              normalizedRawResults={recalculatedResults.rawData} // Pass the categorized raw data
            />
          </div>
        )}

        {/* LLM Metrics Section - only show in test mode with control set */}
        {testMode && normalizedResults && Object.keys(llmMetrics).length > 0 && (
          <div className="model-metrics-section">
            <div className="collapsible-header metrics-header" onClick={toggleModelMetrics}>
              <h3>LLM Model Performance Metrics</h3>
              <button 
                type="button" 
                className="toggle-collapse-button"
              >
                {showModelMetrics ? '▲' : '▼'}
              </button>
            </div>
            
            {showModelMetrics && (
              <div className="model-metrics-container">
                <p className="metrics-explanation">
                  Precision: percentage of model's results that match the control set<br />
                  Recall: percentage of control set items found by the model
                </p>
                
                <div className="metrics-selection-actions">
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllMetricsModels(true)}
                    className="metrics-action-button"
                    disabled={isRecalculating}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllMetricsModels(false)}
                    className="metrics-action-button"
                    disabled={isRecalculating}
                  >
                    Deselect All
                  </button>
                  <button 
                    type="button" 
                    onClick={handleRecalculate}
                    className="metrics-recalculate-button"
                    disabled={isRecalculating || countSelectedMetricsModels() === 0}
                  >
                    {isRecalculating ? (
                      <>
                        <span className="spinner-small"></span>
                        Recalculating...
                      </>
                    ) : (
                      "Recalculate with Selected Models"
                    )}
                  </button>
                </div>
                
                <div className="model-metrics-table-container">
                  <table className="model-metrics-table">
                    <thead>
                      <tr>
                        <th>Use</th>
                        <th>Model</th>
                        <th>Precision</th>
                        <th>Recall</th>
                        <th>Response Time</th>
                        <th>Items Found</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(llmMetrics)
                        .sort((a, b) => {
                          // Sort by highest F1 score (harmonic mean of precision and recall)
                          const f1A = a[1].precision * a[1].recall > 0 
                            ? 2 * (a[1].precision * a[1].recall) / (a[1].precision + a[1].recall)
                            : 0;
                          const f1B = b[1].precision * b[1].recall > 0
                            ? 2 * (b[1].precision * b[1].recall) / (b[1].precision + b[1].recall)
                            : 0;
                          return f1B - f1A;
                        })
                        .map(([model, metrics]) => (
                          <tr key={model} className={metricsModelSelection[model] ? 'selected-model' : 'deselected-model'}>
                            <td className="model-toggle-cell">
                              <input
                                type="checkbox"
                                checked={!!metricsModelSelection[model]}
                                onChange={() => handleMetricsModelToggle(model)}
                                disabled={isRecalculating}
                                id={`metrics-model-${model}`}
                              />
                            </td>
                            <td>{model.split('/')[0]}/{model.split('/')[1].split(':')[0]}</td>
                            <td>
                              <div className="metric-value-cell">
                                <div className="metric-bar" style={{ width: `${metrics.precision}%` }}></div>
                                <span>{metrics.precision}%</span>
                              </div>
                            </td>
                            <td>
                              <div className="metric-value-cell">
                                <div className="metric-bar" style={{ width: `${metrics.recall}%` }}></div>
                                <span>{metrics.recall}%</span>
                              </div>
                            </td>
                            <td>{metrics.responseTime}s</td>
                            <td>{metrics.itemCount}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="metrics-insights">
                  <h4>Performance Insights</h4>
                  <ul>
                    {Object.entries(llmMetrics)
                      .sort((a, b) => b[1].precision - a[1].precision)
                      .slice(0, 1)
                      .map(([model, metrics]) => (
                        <li key={`precision-${model}`}>
                          <strong>Highest Precision:</strong> {model.split('/')[0]}/{model.split('/')[1].split(':')[0]} ({metrics.precision}%)
                        </li>
                      ))}
                    {Object.entries(llmMetrics)
                      .sort((a, b) => b[1].recall - a[1].recall)
                      .slice(0, 1)
                      .map(([model, metrics]) => (
                        <li key={`recall-${model}`}>
                          <strong>Highest Recall:</strong> {model.split('/')[0]}/{model.split('/')[1].split(':')[0]} ({metrics.recall}%)
                        </li>
                      ))}
                    {Object.entries(llmMetrics)
                      .sort((a, b) => {
                        // Sort by highest F1 score
                        const f1A = a[1].precision * a[1].recall > 0 
                          ? 2 * (a[1].precision * a[1].recall) / (a[1].precision + a[1].recall)
                          : 0;
                        const f1B = b[1].precision * b[1].recall > 0
                          ? 2 * (b[1].precision * b[1].recall) / (b[1].precision + b[1].recall)
                          : 0;
                        return f1B - f1A;
                      })
                      .slice(0, 1)
                      .map(([model, metrics]) => {
                        const f1 = metrics.precision * metrics.recall > 0
                          ? Math.round(2 * (metrics.precision * metrics.recall) / (metrics.precision + metrics.recall))
                          : 0;
                        return (
                          <li key={`f1-${model}`}>
                            <strong>Best Overall (F1):</strong> {model.split('/')[0]}/{model.split('/')[1].split(':')[0]} (F1 Score: {f1}%)
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Only show ControlSetEvaluation in test mode */}
        {testMode && normalizedResults && controlSet && (
          <ControlSetEvaluation controlSet={controlSet} normalizedResults={normalizedResults} />
        )}

        {/* Add the PreviousCompanies component before the footer */}
        {previousCompanies.length > 0 && (
          <PreviousCompanies companies={previousCompanies} />
        )}
        
        {normalizedResults && (
          <div className="new-company-section">
            <button 
              onClick={handleNewCompany} 
              className="new-company-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Analyse New Company
            </button>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by OpenRouter API • Using {selectedModels.length} different LLMs{testMode ? ' • Test Mode Active' : ''}</p>
      </footer>
    </div>
  );
}

export default App;