// src/components/TabView.js
import React, { useState } from 'react';

function TabView({ categories, children }) {
  const [activeTab, setActiveTab] = useState(Object.keys(categories)[0]);

  return (
    <div className="tab-view">
      <div className="tab-header">
        {Object.entries(categories).map(([key, category]) => (
          <button
            key={key}
            className={`tab-button ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <span className={`tab-icon ${key}`}>{category.icon}</span>
            <span className="tab-label">{category.label}</span>
            {category.count !== undefined && (
              <span className="tab-count">{category.count}</span>
            )}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {React.Children.map(children, (child, index) => {
          // Only render the child component corresponding to the active tab
          const key = Object.keys(categories)[index];
          return activeTab === key ? child : null;
        })}
      </div>
    </div>
  );
}

export default TabView;