import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import LoadingIndicator from './components/LoadingIndicator';
import ResultsTable from './components/ResultsTable';
import ErrorDisplay from './components/ErrorDisplay';
import ControlSetEvaluation from './components/ControlSetEvaluation';
import { queryLLMs } from './services/llmService';
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

  // Submit handler - Query all LLMs
  const handleSubmit = async (controlSetData) => {
    setIsLoading(true);
    setError(null);
    setRawResults(null);
    setNormalizedResults(null);
    setProgress({});
    
    // Update control set if provided from the form
    if (controlSetData) {
      setControlSet(controlSetData);
    }
    
    try {
      const results = await queryLLMs(
        input, 
        companyDescription,
        longListCount, 
        (model, status) => {
          setProgress(prev => ({
            ...prev,
            [model]: status
          }));
        },
        fastMode // Pass fastMode to the query function
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
      // Create a combined data object that includes both LLM results and control set
      let combinedResults = { ...rawResults };
      
      // Add control set as a separate "model" if it exists and we're in test mode
      if (testMode && controlSet && controlSet.competitors && controlSet.competitors.length > 0) {
        combinedResults['control_set'] = {
          items: controlSet.competitors,
          type: 'control_set'
        };
      }
      
      // Normalize all data together
      const normalizedData = await normalizeResults(combinedResults);
      
      // Get the normalized control set items if they exist
      const normalizedControlSet = normalizedData['control_set'] 
        ? {
            ...controlSet,
            competitors: normalizedData['control_set'].items,
            originalCompetitors: controlSet.competitors
          }
        : controlSet;
      
      // Remove control set from normalized data before processing
      if (normalizedData['control_set']) {
        delete normalizedData['control_set'];
      }
      
      const processed = processResults(normalizedData, shortListCount);
      
      setNormalizedResults({
        summary: processed,
        rawData: normalizedData,
        normalizedControlSet: normalizedControlSet
      });
    } catch (err) {
      setError(err.message || 'An error occurred during normalization');
    } finally {
      setIsNormalizing(false);
    }
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
          <ResultsTable summaryResults={normalizedResults.summary} normalizedRawResults={normalizedResults.rawData} />
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
        <p>Powered by OpenRouter API • Using {fastMode ? '6' : '9'} different LLMs{testMode ? ' • Test Mode Active' : ''}</p>
      </footer>
    </div>
  );
}

export default App;