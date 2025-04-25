import React from 'react';

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
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
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
        <textarea
          id="companyDescription"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          placeholder="Describe what the company does, its main products/services, target market, etc."
          disabled={isLoading}
          className="input-field description-field"
          rows={3}
        />
        <small className="input-help">
          A brief description helps AIs better identify relevant competitors
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
      
      {/* New Test Mode toggle */}
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
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading || !input.trim()}
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