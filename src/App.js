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
            <h2>Raw Results Collected</h2>
            <p>Data collected from {Object.keys(rawResults).length} LLMs. Click Normalize to process and find the most common items.</p>
            <button 
              onClick={handleNormalize} 
              disabled={isNormalizing} 
              className="normalize-button"
            >
              {isNormalizing ? 'Normalizing...' : 'Normalize Results'}
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
    </div>
  );
}

export default App;