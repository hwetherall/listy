import React, { useState, useEffect } from 'react';

function ControlSetInput({ onSave }) {
  const [rawInput, setRawInput] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Parse the input into competitors
  const parseInput = () => {
    if (!rawInput.trim()) return;

    // Split by whitespace and filter out empty entries
    const potentialCompetitors = rawInput
      .split(/\s+/)
      .filter(word => word.trim() !== '' && word.trim().match(/[A-Z]/));
    
    setCompetitors(potentialCompetitors);
    setIsParsed(true);
  };

  // Handle saving finalized data
  const handleSave = () => {
    onSave({
      competitors: competitors
    });
    setIsCollapsed(true);
  };

  // Add a new competitor manually
  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  // Remove a competitor
  const removeCompetitor = (index) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  if (isCollapsed) {
    return (
      <div className="control-set-input collapsed">
        <div className="collapsed-header">
          <h3>Control Set: {competitors.length} competitors</h3>
          <button 
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="expand-button"
          >
            Edit Control Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="control-set-input">
      {!isParsed ? (
        <div className="input-section">
          <h3>Enter Control Set Data</h3>
          <p className="input-helper-text">
            Paste your list of competitors. Each word will be treated as a separate competitor.
          </p>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Example: Lime Bird Spin Tier Jump Voi..."
            className="control-set-textarea"
            rows={6}
          />
          <div className="button-row">
            <button 
              type="button"
              onClick={parseInput}
              className="parse-button"
              disabled={!rawInput.trim()}
            >
              Parse Control Set
            </button>
          </div>
        </div>
      ) : (
        <div className="validation-section">
          <h3>Verify Parsed Control Set</h3>
          
          <div className="competitors-section">
            <h4>Competitors:</h4>
            <ul className="competitors-list">
              {competitors.map((competitor, index) => (
                <li key={index} className="competitor-item">
                  <span>{competitor}</span>
                  <button 
                    type="button" 
                    onClick={() => removeCompetitor(index)}
                    className="remove-competitor"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="add-competitor">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                placeholder="Add competitor..."
                className="competitor-input"
              />
              <button 
                type="button"
                onClick={addCompetitor}
                className="add-competitor-button"
                disabled={!newCompetitor.trim()}
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="button-row">
            <button 
              type="button"
              onClick={() => setIsParsed(false)}
              className="back-button"
            >
              Back to Input
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="save-button"
            >
              Save Control Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlSetInput;