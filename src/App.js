import React, { useState } from 'react';
import InputForm from './components/InputForm';
import LoadingIndicator from './components/LoadingIndicator';
import ResultsTable from './components/ResultsTable';
import ErrorDisplay from './components/ErrorDisplay';
import { queryLLMs } from './services/llmService';
import { normalizeResults } from './services/normalizationService';
import { processResults } from './utils/resultProcessor';
import './styles/main.css';

function App() {
  // State management
  const [input, setInput] = useState('');
  const [longListCount, setLongListCount] = useState(20);
  const [shortListCount, setShortListCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResults, setRawResults] = useState(null);
  const [normalizedResults, setNormalizedResults] = useState(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [progress, setProgress] = useState({});

  // Submit handler - Query all LLMs
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setRawResults(null);
    setNormalizedResults(null);
    setProgress({});
    
    try {
      const results = await queryLLMs(
        input, 
        longListCount, 
        (model, status) => {
          setProgress(prev => ({
            ...prev,
            [model]: status
          }));
        }
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
      const normalized = await normalizeResults(rawResults);
      const processed = processResults(normalized, shortListCount);
      setNormalizedResults(processed);
    } catch (err) {
      setError(err.message || 'An error occurred during normalization');
    } finally {
      setIsNormalizing(false);
    }
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
          longListCount={longListCount}
          setLongListCount={setLongListCount}
          shortListCount={shortListCount}
          setShortListCount={setShortListCount}
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
          <ResultsTable results={normalizedResults} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by OpenRouter API • Using 9 different LLMs</p>
      </footer>
    </div>
  );
}

// Add these styles to your main.css
const additionalStyles = `
.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-right: var(--space-4);
  flex-shrink: 0;
}

.normalization-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-6);
}

.normalization-text {
  flex: 1;
}

.normalization-text h2 {
  margin: 0 0 var(--space-2) 0;
}

.normalization-text p {
  margin: 0;
  color: var(--neutral-600);
}

.app-footer {
  margin-top: var(--space-12);
  padding-top: var(--space-6);
  border-top: 1px solid var(--neutral-200);
  text-align: center;
  color: var(--neutral-500);
  font-size: 0.875rem;
}
`;

export default App;