import React, { useState, useEffect } from 'react';
import { generateCompanyDescription } from '../services/descriptionService';
import ControlSetInput from './ControlSetInput';

function InputForm({
  input,
  setInput,
  companyDescription,
  setCompanyDescription,
  longListCount,
  setLongListCount,
  shortListCount,
  setShortListCount,
  fastMode,
  setFastMode,
  testMode,
  setTestMode,
  onSubmit,
  isLoading
}) {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [controlSetData, setControlSetData] = useState(null);
  
  // Reset control set data when input is cleared (new company)
  useEffect(() => {
    if (!input.trim()) {
      setControlSetData(null);
    }
  }, [input]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(controlSetData);
  };

  const handleGenerateDescription = async () => {
    if (!input.trim() || isGeneratingDescription) return;
    
    setIsGeneratingDescription(true);
    try {
      const description = await generateCompanyDescription(input);
      setCompanyDescription(description);
    } catch (error) {
      // Show error in a user-friendly way - you could add a toast notification here
      console.error('Failed to generate description:', error);
      alert('Failed to generate description. Please try again or enter manually.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleControlSetSave = (data) => {
    setControlSetData(data);
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="input">Find competitors for:</label>
        <input
          type="text"
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Airbnb, Uber, Stripe..."
          required
          disabled={isLoading}
          className="input-field"
        />
        <small className="input-help">
          Enter the name of the company you want to analyze
        </small>
      </div>
      
      <div className="form-group">
        <label htmlFor="companyDescription">Company description:</label>
        <div className="description-field-container">
          <textarea
            id="companyDescription"
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            placeholder="Describe what the company does, its main products/services, target market, etc."
            disabled={isLoading}
            className="input-field description-field"
            rows={3}
          />
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isLoading || isGeneratingDescription || !input.trim()}
            className="generate-description-button"
            title="Auto-generate description using AI"
          >
            {isGeneratingDescription ? (
              <span className="spinner-small"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <path d="M9 9h.01"></path>
                <path d="M15 9h.01"></path>
              </svg>
            )}
            {isGeneratingDescription ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <small className="input-help">
          A brief description helps AIs better identify relevant competitors. Click "Generate" to auto-create a description.
        </small>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="longListCount">Long List Count</label>
          <div className="counter-input">
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setLongListCount(Math.max(1, longListCount - 5))}
              disabled={longListCount <= 5 || isLoading || testMode}
            >
              −
            </button>
            <input
              type="number"
              id="longListCount"
              value={longListCount}
              onChange={(e) => setLongListCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max="100"
              required
              disabled={isLoading || testMode}
              className="input-field counter-field"
            />
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setLongListCount(Math.min(100, longListCount + 5))}
              disabled={longListCount >= 100 || isLoading || testMode}
            >
              +
            </button>
          </div>
          <small className="input-help">
            {testMode 
              ? "In Test Mode, automatically set to 150% of Control Set size" 
              : "Number of items each LLM will return"}
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="shortListCount">Short List Count</label>
          <div className="counter-input">
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setShortListCount(Math.max(1, shortListCount - 1))}
              disabled={shortListCount <= 1 || isLoading || testMode}
            >
              −
            </button>
            <input
              type="number"
              id="shortListCount"
              value={shortListCount}
              onChange={(e) => setShortListCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max="50"
              required
              disabled={isLoading || testMode}
              className="input-field counter-field"
            />
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setShortListCount(Math.min(50, shortListCount + 1))}
              disabled={shortListCount >= 50 || isLoading || testMode}
            >
              +
            </button>
          </div>
          <small className="input-help">
            {testMode 
              ? "In Test Mode, automatically matches Control Set size" 
              : "Number of most frequent items to show in final results"}
          </small>
        </div>
      </div>
      
      <div className="form-group">
        <label>Mode</label>
        <div className="toggle-container">
          <button
            type="button"
            className={`toggle-button ${fastMode ? 'active' : ''}`}
            onClick={() => setFastMode(true)}
            disabled={isLoading}
          >
            Fast
          </button>
          <button
            type="button"
            className={`toggle-button ${!fastMode ? 'active' : ''}`}
            onClick={() => setFastMode(false)}
            disabled={isLoading}
          >
            Deep
          </button>
        </div>
        <small className="input-help">
          {fastMode 
            ? "Fast mode queries 6 major LLMs for quicker results" 
            : "Deep mode queries all 9 LLMs for more comprehensive results"}
        </small>
      </div>
      
      <div className="form-group">
        <label>Test Mode</label>
        <div className="toggle-container">
          <button
            type="button"
            className={`toggle-button ${!testMode ? 'active' : ''}`}
            onClick={() => setTestMode(false)}
            disabled={isLoading}
          >
            Off
          </button>
          <button
            type="button"
            className={`toggle-button ${testMode ? 'active' : ''}`}
            onClick={() => setTestMode(true)}
            disabled={isLoading}
          >
            On
          </button>
        </div>
        <small className="input-help">
          {testMode 
            ? "Test Mode enabled - Control Set features activated with automatic list counts" 
            : "Test Mode disabled - Standard mode without Control Set features"}
        </small>
      </div>
      
      {testMode && (
        <div className="control-set-container">
          <ControlSetInput onSave={handleControlSetSave} />
        </div>
      )}
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading || !input.trim() || (testMode && !controlSetData)}
      >
        {isLoading ? (
          <>
            <span className="spinner-small"></span>
            Processing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
            Get Results
          </>
        )}
      </button>
    </form>
  );
}

export default InputForm;