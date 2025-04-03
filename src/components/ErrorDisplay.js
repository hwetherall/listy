import React from 'react';

function ErrorDisplay({ message }) {
  return (
    <div className="error-display">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3>Error</h3>
        <p>{message}</p>
        <p className="error-help">
          If this keeps happening, check your API key or try a different input.
        </p>
      </div>
    </div>
  );
}

export default ErrorDisplay;