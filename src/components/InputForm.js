import React, { useState, useEffect } from 'react';
import { generateCompanyDescription } from '../services/descriptionService';
import ControlSetInput from './ControlSetInput';
import { LLM_MODELS } from '../services/llmService';

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
  reportMode,
  setReportMode,
  selectedModels,
  setSelectedModels,
  selectedRegion,
  setSelectedRegion,
  selectedCategories,
  setSelectedCategories,
  onSubmit,
  isLoading
}) {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [controlSetData, setControlSetData] = useState(null);
  const [showModelSelection, setShowModelSelection] = useState(false);
  
  // Available regions for report mode
  const regions = [
    'Europe',
    'MENA',
    'LATAM',
    'North America',
    'Africa',
    'South East Asia',
    'South Asia',
    'China',
    'East Asia',
    'Australasia'
  ];
  
  // Competitor categories for report mode
  const competitorCategories = [
    { id: 'incumbent', label: 'Incumbents' },
    { id: 'regional', label: 'Regional Players' },
    { id: 'interesting', label: 'New and Interesting' },
    { id: 'graveyard', label: 'Graveyard' }
  ];
  
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

  const toggleModelSelection = () => {
    setShowModelSelection(!showModelSelection);
  };

  const handleModelToggle = (model) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleSelectAllModels = () => {
    setSelectedModels([...LLM_MODELS]);
  };

  const handleClearAllModels = () => {
    setSelectedModels([]);
  };
  
  const handleCategoryToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  const handleSelectAllCategories = () => {
    setSelectedCategories(competitorCategories.map(category => category.id));
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
          <div className="description-buttons">
            <button
              type="button"
              onClick={() => setCompanyDescription("Neuron Mobility is a Singapore-based company founded in 2016 that operates a shared e-scooter and e-bike rental service, focusing on safe, sustainable, and convenient urban transportation. They design and manufacture their own commercial-grade vehicles, equipped with advanced safety features like app-controlled helmet locks and geofencing technology, and partner with cities across Australia, New Zealand, the UK, and Canada to reduce congestion and emissions.")}
              disabled={isLoading}
              className="test-button"
              title="Fill with test description"
            >
              Test
            </button>
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
        </div>
        <small className="input-help">
          A brief description helps AIs better identify relevant competitors. Click "Generate" to auto-create a description.
        </small>
      </div>
      
      <div className="form-group mode-section">
        <h3 className="section-title">Settings</h3>
        <div className="mode-toggles">
          <div className="toggle-container mode-toggle">
            <div className="toggle-label">Mode</div>
            <div className="modern-toggle">
              <button
                type="button"
                className={`toggle-pill ${!reportMode ? 'active' : ''}`}
                onClick={() => setReportMode(false)}
                disabled={isLoading}
              >
                Standard
              </button>
              <button
                type="button"
                className={`toggle-pill ${reportMode ? 'active' : ''}`}
                onClick={() => setReportMode(true)}
                disabled={isLoading}
              >
                Report
              </button>
            </div>
          </div>
          
          <div className="toggle-container mode-toggle">
            <div className="toggle-label">Speed</div>
            <div className="modern-toggle">
              <button
                type="button"
                className={`toggle-pill ${fastMode ? 'active' : ''}`}
                onClick={() => setFastMode(true)}
                disabled={isLoading}
              >
                Fast
              </button>
              <button
                type="button"
                className={`toggle-pill ${!fastMode ? 'active' : ''}`}
                onClick={() => setFastMode(false)}
                disabled={isLoading}
              >
                Deep
              </button>
            </div>
          </div>
          
          {!reportMode && (
            <div className="toggle-container mode-toggle">
              <div className="toggle-label">Test Mode</div>
              <div className="modern-toggle">
                <button
                  type="button"
                  className={`toggle-pill ${!testMode ? 'active' : ''}`}
                  onClick={() => setTestMode(false)}
                  disabled={isLoading}
                >
                  Off
                </button>
                <button
                  type="button"
                  className={`toggle-pill ${testMode ? 'active' : ''}`}
                  onClick={() => setTestMode(true)}
                  disabled={isLoading}
                >
                  On
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mode-description">
          {reportMode 
            ? "Report mode returns fixed sets of 10 companies for each selected category" 
            : fastMode 
              ? "Fast mode queries 6 major LLMs for quicker results" 
              : "Deep mode queries all 9 LLMs for more comprehensive results"}
        </div>
      </div>
      
      {!reportMode && (
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
      )}
      
      {reportMode && (
        <div className="report-mode-options">
          <div className="form-group">
            <label htmlFor="region-select">Select Region for Regional Players:</label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="modern-select"
              disabled={isLoading}
              required={reportMode && selectedCategories.includes('regional')}
            >
              <option value="">-- Select a Region --</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <small className="input-help">
              This region will be used specifically for the "Regional Players" category
            </small>
          </div>
          
          <div className="form-group">
            <label>Select Competitor Categories to Include:</label>
            <div className="category-selection-container">
              <div className="category-selection-actions">
                <button 
                  type="button" 
                  onClick={handleSelectAllCategories}
                  className="category-selection-action-button"
                  disabled={isLoading}
                >
                  Select All
                </button>
              </div>
              <div className="category-checkboxes">
                {competitorCategories.map(category => (
                  <div key={category.id} className="category-checkbox-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        disabled={isLoading}
                        className="modern-checkbox"
                      />
                      <span>{category.label}</span>
                    </label>
                  </div>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <div className="category-selection-error">
                  Please select at least one category
                </div>
              )}
              {selectedCategories.includes('regional') && !selectedRegion && (
                <div className="category-selection-error">
                  Please select a region for Regional Players
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!reportMode && (
        <div className="form-group">
          <div className="collapsible-header" onClick={toggleModelSelection}>
            <label>Custom Model Selection</label>
            <button 
              type="button" 
              className="toggle-collapse-button"
            >
              {showModelSelection ? '▲' : '▼'}
            </button>
          </div>
          <small className="input-help">
            Select which LLMs to use for your query ({selectedModels.length} selected)
          </small>
          
          {showModelSelection && (
            <div className="model-selection-container">
              <div className="model-selection-actions">
                <button 
                  type="button" 
                  onClick={handleSelectAllModels}
                  className="model-selection-action-button"
                  disabled={isLoading}
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  onClick={handleClearAllModels}
                  className="model-selection-action-button"
                  disabled={isLoading}
                >
                  Clear All
                </button>
              </div>
              <div className="model-checkboxes">
                {LLM_MODELS.map(model => (
                  <div key={model} className="model-checkbox-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => handleModelToggle(model)}
                        disabled={isLoading}
                      />
                      {model.split('/')[0]}/{model.split('/')[1].split(':')[0]}
                    </label>
                  </div>
                ))}
              </div>
              {selectedModels.length === 0 && (
                <div className="model-selection-error">
                  Please select at least one model
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {testMode && !reportMode && (
        <div className="control-set-container">
          <ControlSetInput onSave={handleControlSetSave} />
        </div>
      )}
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={
          isLoading || 
          !input.trim() || 
          (testMode && !reportMode && !controlSetData) || 
          (reportMode && selectedCategories.length === 0) ||
          (reportMode && selectedCategories.includes('regional') && !selectedRegion) ||
          (!reportMode && selectedModels.length === 0)
        }
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