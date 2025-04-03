import React from 'react';

function LoadingIndicator({ message, progress = {} }) {
  // Helper function to get provider name from model
  const getProviderName = (model) => {
    if (!model) return '';
    const parts = model.split('/');
    return parts[0]; // Get just the provider name
  };

  // Convert progress object to array for rendering
  const progressItems = Object.entries(progress).map(([model, status]) => ({
    model,
    provider: getProviderName(model),
    status
  }));

  return (
    <div className="loading-indicator">
      <div className="spinner"></div>
      <p className="loading-message">{message || 'Loading...'}</p>
      
      {progressItems.length > 0 && (
        <div className="progress-container">
          {progressItems.map(({ model, provider, status }) => (
            <div 
              key={model} 
              className={`progress-item ${status}`}
            >
              <span className="provider-name">{provider}</span>
              <span className="status-indicator">
                {status === 'requesting' && '⏳'}
                {status === 'success' && '✅'}
                {status === 'error' && '❌'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LoadingIndicator;