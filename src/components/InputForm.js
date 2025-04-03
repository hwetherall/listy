import React from 'react';

function InputForm({
  input,
  setInput,
  longListCount,
  setLongListCount,
  shortListCount,
  setShortListCount,
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
        <label htmlFor="input">Find things similar to:</label>
        <input
          type="text"
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Tesla, Elon Musk, Autonomous Drones, China, 'AI engineers who lived in Beijing and Houston'"
          required
          disabled={isLoading}
          className="input-field"
        />
        <small className="input-help">
          Enter any company, person, industry, country, or complex description
        </small>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="longListCount">Long List Count:</label>
          <input
            type="number"
            id="longListCount"
            value={longListCount}
            onChange={(e) => setLongListCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            max="100"
            required
            disabled={isLoading}
            className="input-field"
          />
          <small className="input-help">
            Number of items each LLM will return
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="shortListCount">Short List Count:</label>
          <input
            type="number"
            id="shortListCount"
            value={shortListCount}
            onChange={(e) => setShortListCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            max="50"
            required
            disabled={isLoading}
            className="input-field"
          />
          <small className="input-help">
            Number of most frequent items to show in final results
          </small>
        </div>
      </div>
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
}

export default InputForm;