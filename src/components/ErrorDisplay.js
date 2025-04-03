import React from 'react';

function ErrorDisplay({ message }) {
  return (
    <div className="error-display">
      <div className="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div className="error-content">
        <h3>Error Occurred</h3>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="error-action-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
            </svg>
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}

// Add these styles to your main.css
const additionalStyles = `
.error-display {
  display: flex;
  align-items: flex-start;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin: var(--space-6) 0;
  box-shadow: var(--shadow-md);
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  margin-right: var(--space-6);
  color: var(--error);
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-content h3 {
  margin-top: 0;
  margin-bottom: var(--space-2);
  color: var(--neutral-900);
}

.error-message {
  background-color: rgba(239, 68, 68, 0.05);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--error);
  margin-bottom: var(--space-4);
  color: var(--neutral-800);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  overflow-x: auto;
}

.error-actions {
  display: flex;
  gap: var(--space-2);
}

.error-action-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background-color: white;
  border: 1px solid var(--neutral-300);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--neutral-800);
  cursor: pointer;
  transition: var(--transition-fast);
}

.error-action-button:hover {
  background-color: var(--neutral-100);
  border-color: var(--neutral-400);
}
`;

export default ErrorDisplay;