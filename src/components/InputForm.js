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
              disabled={longListCount <= 5 || isLoading}
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
              disabled={isLoading}
              className="input-field counter-field"
            />
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setLongListCount(Math.min(100, longListCount + 5))}
              disabled={longListCount >= 100 || isLoading}
            >
              +
            </button>
          </div>
          <small className="input-help">
            Number of items each LLM will return
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="shortListCount">Short List Count</label>
          <div className="counter-input">
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setShortListCount(Math.max(1, shortListCount - 1))}
              disabled={shortListCount <= 1 || isLoading}
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
              disabled={isLoading}
              className="input-field counter-field"
            />
            <button 
              type="button" 
              className="counter-btn"
              onClick={() => setShortListCount(Math.min(50, shortListCount + 1))}
              disabled={shortListCount >= 50 || isLoading}
            >
              +
            </button>
          </div>
          <small className="input-help">
            Number of most frequent items to show in final results
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
            Thorough
          </button>
        </div>
        <small className="input-help">
          {fastMode 
            ? "Fast mode queries 6 major LLMs for quicker results" 
            : "Thorough mode queries all 9 LLMs for more comprehensive results"}
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

// Add these styles to your main.css
const additionalStyles = `
.counter-input {
  display: flex;
  align-items: center;
}

.counter-field {
  text-align: center;
  border-radius: 0;
  -moz-appearance: textfield;
}

.counter-field::-webkit-outer-spin-button,
.counter-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.counter-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--neutral-100);
  border: 1px solid var(--neutral-300);
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  padding: 0;
}

.counter-btn:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  border-right: none;
}

.counter-btn:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  border-left: none;
}

.counter-btn:hover:not(:disabled) {
  background-color: var(--neutral-200);
}

.counter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.toggle-container {
  display: flex;
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--neutral-300);
}

.toggle-button {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background-color: var(--neutral-50);
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}

.toggle-button.active {
  background-color: var(--primary);
  color: white;
}

.toggle-button:not(.active):hover:not(:disabled) {
  background-color: var(--neutral-200);
}

.toggle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

export default InputForm;