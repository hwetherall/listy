import React from 'react';

function LoadingIndicator({ message, progress = {} }) {
  // Helper function to get provider name from model
  const getProviderName = (model) => {
    if (!model) return '';
    const parts = model.split('/');
    return parts[0]; // Get just the provider name
  };

  // Convert progress object to array for rendering
  const progressItems = Object.entries(progress).map(([model, statusData]) => {
    // Handle both string status (legacy) and object format with response time
    const status = typeof statusData === 'object' ? statusData.status : statusData;
    const responseTime = typeof statusData === 'object' ? statusData.responseTime : null;
    
    return {
      model,
      provider: getProviderName(model),
      status,
      responseTime
    };
  });

  // Calculate overall progress percentage
  const totalModels = progressItems.length;
  const completedModels = progressItems.filter(item => 
    item.status === 'success' || item.status === 'error'
  ).length;
  
  const progressPercentage = totalModels > 0 
    ? Math.round((completedModels / totalModels) * 100) 
    : 0;

  return (
    <div className="loading-indicator">
      <div className="loading-header">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
        </div>
        
        <div className="loading-info">
          <h3 className="loading-title">{message || 'Loading...'}</h3>
          {progressItems.length > 0 && (
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <span className="progress-text">{progressPercentage}% Complete</span>
            </div>
          )}
        </div>
      </div>
      
      {progressItems.length > 0 && (
        <div className="progress-container">
          {progressItems.map(({ model, provider, status, responseTime }) => (
            <div 
              key={model} 
              className={`progress-item ${status}`}
            >
              <div className="provider-info">
                <span className="provider-name">{provider}</span>
                {responseTime && status === 'success' && (
                  <span className="response-time">{responseTime}s</span>
                )}
              </div>
              <span className="status-indicator">
                {status === 'requesting' && (
                  <div className="dot-pulse"></div>
                )}
                {status === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-icon">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                )}
                {status === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add these styles to your main.css
const additionalStyles = `
.loading-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-6);
}

.loading-spinner-container {
  margin-right: var(--space-4);
}

.loading-info {
  flex: 1;
}

.loading-title {
  margin: 0 0 var(--space-2) 0;
  font-size: 1.25rem;
  color: var(--neutral-800);
}

.progress-bar-container {
  height: 8px;
  background-color: var(--neutral-200);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, var(--primary), var(--secondary));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 10px;
  right: 0;
  font-size: 0.75rem;
  color: var(--neutral-600);
}

.provider-info {
  display: flex;
  align-items: center;
}

.provider-name {
  margin-right: var(--space-2);
}

.response-time {
  font-size: 0.75rem;
  color: var(--neutral-600);
  background-color: var(--neutral-100);
  padding: 2px 6px;
  border-radius: 4px;
}

.success-icon {
  color: var(--success);
}

.error-icon {
  color: var(--error);
}

.dot-pulse {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--warning);
  color: var(--warning);
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.25s;
}

.dot-pulse::before, .dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--warning);
  color: var(--warning);
}

.dot-pulse::before {
  left: -15px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  left: 15px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dot-pulse {
  0% {
    transform: scale(0.2);
    opacity: 0.8;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.2);
    opacity: 0.8;
  }
}
`;

export default LoadingIndicator;