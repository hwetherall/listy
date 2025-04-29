import React, { useState, useEffect } from 'react';
import './CompetitorReport.css';

const CompetitorReport = ({ reportContent, companyName, onSave }) => {
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [sections, setSections] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Parse the report into sections when content changes
  useEffect(() => {
    if (reportContent) {
      // Split content by headings (lines starting with # or ## or numbers like "1.")
      const sectionRegex = /(?:^|\n)(?:#+\s*|(?:\d+\.|\w+:)\s+)(.+)(?:\n|$)/g;
      let matches = [...reportContent.matchAll(sectionRegex)];
      
      // If no matches (no clear headings), treat the whole thing as one section
      if (matches.length === 0) {
        setSections([{
          title: 'Report',
          content: reportContent,
        }]);
        return;
      }
      
      // Process matches to extract sections
      const extractedSections = [];
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const startIndex = match.index;
        const title = match[1].trim();
        
        // Find the end of this section (start of the next section or end of content)
        const endIndex = (i < matches.length - 1) ? matches[i + 1].index : reportContent.length;
        
        // Extract the section content (excluding the heading itself)
        const headerEndIndex = startIndex + match[0].length;
        const sectionContent = reportContent.substring(headerEndIndex, endIndex).trim();
        
        extractedSections.push({
          title,
          content: sectionContent,
        });
      }
      
      setSections(extractedSections);
      setEditableContent(reportContent); // Initialize editable content
    }
  }, [reportContent]);

  // Handle content editing
  const handleSectionEdit = (index) => {
    setIsEditing(true);
    setEditingSectionIndex(index);
  };

  // Save edited section
  const handleSectionSave = () => {
    if (editingSectionIndex === null) return;
    
    // Update the sections array
    const updatedSections = [...sections];
    updatedSections[editingSectionIndex].content = editableContent;
    setSections(updatedSections);
    
    // Exit editing mode
    setIsEditing(false);
    setEditingSectionIndex(null);
    
    // Combine sections back into full report
    const updatedReport = updatedSections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
    
    // Call the parent's save handler
    if (onSave) {
      onSave(updatedReport);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to the current section content
    setEditableContent(sections[editingSectionIndex].content);
    setIsEditing(false);
    setEditingSectionIndex(null);
  };

  // Handle text changes in the editor
  const handleTextChange = (e) => {
    setEditableContent(e.target.value);
  };

  // Copy report to clipboard
  const handleCopyToClipboard = () => {
    const fullReport = sections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(fullReport)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
      });
  };

  if (!reportContent) {
    return (
      <div className="competitor-report-container empty">
        <p>No competitor report available. Please generate a report first.</p>
      </div>
    );
  }

  return (
    <div className="competitor-report-container">
      <div className="report-header">
        <h2>Competitor Analysis Report: {companyName}</h2>
        <div className="report-actions">
          <button
            className={`copy-button ${copySuccess ? 'success' : ''}`}
            onClick={handleCopyToClipboard}
          >
            {copySuccess ? 'Copied!' : 'Copy Report'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="report-editor">
          <h3>Editing: {sections[editingSectionIndex]?.title}</h3>
          <textarea
            value={editableContent}
            onChange={handleTextChange}
            className="report-textarea"
          />
          <div className="editor-actions">
            <button onClick={handleCancelEdit} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSectionSave} className="save-button">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="report-sections">
          {sections.map((section, index) => (
            <div key={index} className="report-section">
              <div className="section-header">
                <h3>{section.title}</h3>
                <button
                  onClick={() => {
                    setEditableContent(section.content);
                    handleSectionEdit(index);
                  }}
                  className="edit-button"
                >
                  Edit
                </button>
              </div>
              <div className="section-content">
                {section.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitorReport; 