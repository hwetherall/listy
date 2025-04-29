import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import LoadingIndicator from './components/LoadingIndicator';
import ResultsTable from './components/ResultsTable';
import ErrorDisplay from './components/ErrorDisplay';
import ControlSetEvaluation from './components/ControlSetEvaluation';
import { 
  queryLLMs, 
  LLM_MODELS, 
  generateIncumbentPrompt, 
  generateRegionalPrompt, 
  generateInterestingPrompt, 
  generateGraveyardPrompt,
  generateRegionSpecificPrompt,
  preprocessReport,
  generateCompetitorReport
} from './services/llmService';
import { normalizeResults } from './services/normalizationService';
import { processResults } from './utils/resultProcessor';
import './styles/main.css';
import PreviousCompanies from './components/PreviousCompanies';
import env from './utils/customEnv';
// Import debug module
import { checkApiKey, testApiKey } from './debug';
// Import the new ReportResultsTable component
import ReportResultsTable from './components/ReportResultsTable';
import './components/ReportResultsTable.css';
// Import the CompetitorReport component
import CompetitorReport from './components/CompetitorReport';
import './components/CompetitorReport.css';

function App() {
  // State for API key status and validity
  const [apiKeyStatus, setApiKeyStatus] = useState({ checked: false, valid: false, message: null });
  
  // Debug - check if API key is loaded
  useEffect(() => {
    console.log('App mounted - checking API key...');
    const hasApiKey = checkApiKey();
    console.log('API key available:', hasApiKey);
    console.log('CustomEnv API key (first 10 chars):', env.OPENROUTER_API_KEY ? env.OPENROUTER_API_KEY.substring(0, 10) + '...' : 'Not available');
    
    // Test the API key if it exists
    if (hasApiKey) {
      const validateApiKey = async () => {
        const result = await testApiKey();
        setApiKeyStatus({
          checked: true,
          valid: result.success,
          message: result.message
        });
        
        if (!result.success) {
          console.error('API key validation failed:', result.message);
        }
      };
      
      validateApiKey();
    } else {
      setApiKeyStatus({
        checked: true,
        valid: false,
        message: 'No API key found. Please set REACT_APP_OPENROUTER_API_KEY in your environment.'
      });
    }
  }, []);

  // State management
  const [input, setInput] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [longListCount, setLongListCount] = useState(20);
  const [shortListCount, setShortListCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResults, setRawResults] = useState(null);
  const [normalizedResults, setNormalizedResults] = useState(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [progress, setProgress] = useState({});
  const [fastMode, setFastMode] = useState(true); // Default to fast mode
  const [controlSet, setControlSet] = useState(null);
  const [testMode, setTestMode] = useState(false); // New test mode state
  const [previousCompanies, setPreviousCompanies] = useState([]);
  const [selectedModels, setSelectedModels] = useState([...LLM_MODELS]); // Initialize with all models
  const [showModelMetrics, setShowModelMetrics] = useState(false);
  const [llmMetrics, setLlmMetrics] = useState({});
  
  // State for model selection in the metrics panel
  const [metricsModelSelection, setMetricsModelSelection] = useState({});
  const [recalculatedResults, setRecalculatedResults] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Add new state for Report Mode
  const [reportMode, setReportMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['incumbent', 'regional', 'interesting', 'graveyard']);

  // Add state in App.js for categorized results
  const [categorizedResults, setCategorizedResults] = useState({
    incumbent: [],
    regional: [],
    interesting: [],
    graveyard: []
  });

  // Add new state for the report processing
  const [isProcessingReport, setIsProcessingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState({});
  const [reportResults, setReportResults] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [showReportResults, setShowReportResults] = useState(false);
  
  // Add new state for the competitor report
  const [competitorReport, setCompetitorReport] = useState(null);
  const [isGeneratingCompetitorReport, setIsGeneratingCompetitorReport] = useState(false);
  const [competitorReportProgress, setCompetitorReportProgress] = useState({});
  const [showCompetitorReport, setShowCompetitorReport] = useState(false);
  
  // Add state for managing manually removed companies
  const [filteredReportResults, setFilteredReportResults] = useState(null);

  // Effect to update list counts when control set changes and test mode is active
  useEffect(() => {
    if (testMode && controlSet && controlSet.competitors && controlSet.competitors.length > 0) {
      const competitorCount = controlSet.competitors.length;
      setShortListCount(competitorCount);
      setLongListCount(Math.ceil(competitorCount * 1.5)); // 50% more
    } else if (testMode && (!controlSet || !controlSet.competitors || controlSet.competitors.length === 0)) {
      // Reset to default values if there are no competitors in test mode
      setShortListCount(10);
      setLongListCount(20);
    }
  }, [controlSet, testMode]);

  // Initialize metrics model selection when llmMetrics changes
  useEffect(() => {
    if (Object.keys(llmMetrics).length > 0) {
      const initialSelections = {};
      Object.keys(llmMetrics).forEach(model => {
        initialSelections[model] = true; // Default all to selected
      });
      setMetricsModelSelection(initialSelections);
      setRecalculatedResults(null); // Reset recalculated results when raw metrics change
    }
  }, [llmMetrics]);
  
  // Set filtered results when report results change
  useEffect(() => {
    if (reportResults) {
      setFilteredReportResults(reportResults);
    }
  }, [reportResults]);

  // Helper function to parse numbered list from LLM response 
  const parseNumberedList = (content) => {
    if (!content) return [];
    
    // Regular expression to match numbered list items
    // This handles different numbering formats (1., 1), etc.
    const regex = /\d+[\.\)]\s*(.*?)(?=\n\d+[\.\)]|\n\n|$)/gs;
    const matches = [...content.matchAll(regex)];
    
    return matches.map(match => match[1].trim());
  };

  // Submit handler - Query all LLMs
  const handleSubmit = async (controlSetData) => {
    setIsLoading(true);
    setError(null);
    setRawResults(null);
    setNormalizedResults(null);
    setProgress({});
    setLlmMetrics({});
    setRecalculatedResults(null);
    
    // Reset competitor report state
    setCompetitorReport(null);
    setShowCompetitorReport(false);
    setFilteredReportResults(null);
    
    // Update control set if provided from the form
    if (controlSetData) {
      setControlSet(controlSetData);
    }
    
    try {
      if (reportMode) {
        // In Report Mode, we force 10 results per category and only query selected categories
        const reportResults = {};
        
        // Loop through selected categories and query LLMs
        for (const category of selectedCategories) {
          let categoryPrompt = '';
          
          // Generate the appropriate prompt for each category
          if (category === 'incumbent') {
            categoryPrompt = generateIncumbentPrompt(input, companyDescription, 10);
          } else if (category === 'regional') {
            // For regional, use the region-specific prompt
            if (!selectedRegion) {
              throw new Error('Region must be selected for Regional Players category');
            }
            categoryPrompt = generateRegionSpecificPrompt(input, companyDescription, selectedRegion, 10);
          } else if (category === 'interesting') {
            categoryPrompt = generateInterestingPrompt(input, companyDescription, 10);
          } else if (category === 'graveyard') {
            categoryPrompt = generateGraveyardPrompt(input, companyDescription, 10);
          }
          
          // USE THE IMPORTED queryLLMs function instead of directly querying here
          const categoryResults = await queryLLMs(
            input,
            companyDescription,
            10, // Fixed size for report mode
            (model, status, responseTime) => {
              setProgress(prev => ({
                ...prev,
                [model]: {
                  status,
                  responseTime,
                  category
                }
              }));
            },
            fastMode,
            fastMode ? null : selectedModels, // Only use selectedModels if not in fastMode
            category, // Pass the current category
            categoryPrompt // Pass the generated prompt
          );
          
          // Store results for this category
          reportResults[category] = categoryResults[category];
        }
        
        setRawResults(reportResults);
      } else {
        // Standard mode - query all categories as before
        const results = await queryLLMs(
          input, 
          companyDescription,
          longListCount, 
          (model, status, responseTime) => {
            setProgress(prev => ({
              ...prev,
              [model]: {
                status,
                responseTime
              }
            }));
          },
          fastMode, // Pass fastMode to the query function
          selectedModels // Pass the selected models to the query function
        );
        setRawResults(results);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while querying LLMs');
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize handler - Process results
  const handleNormalize = async () => {
    if (!rawResults) return;
    
    setIsNormalizing(true);
    setError(null);
    
    try {
      // Process results based on mode
      if (reportMode) {
        // For Report Mode, we want 10 companies from each selected category
        const normalizedData = {};
        const processedResults = {};
        
        // Process each selected category
        for (const category of selectedCategories) {
          if (rawResults[category]) {
            // Normalize this category
            normalizedData[category] = await normalizeResults(rawResults[category]);
            
            // Process with fixed count of 10 for report mode
            processedResults[category] = processResults(normalizedData[category], 10);
          } else {
            normalizedData[category] = [];
            processedResults[category] = { items: [] };
          }
        }
        
        // Update categorized results
        setCategorizedResults({
          incumbent: selectedCategories.includes('incumbent') ? processedResults.incumbent.items || [] : [],
          regional: selectedCategories.includes('regional') ? processedResults.regional.items || [] : [],
          interesting: selectedCategories.includes('interesting') ? processedResults.interesting.items || [] : [],
          graveyard: selectedCategories.includes('graveyard') ? processedResults.graveyard.items || [] : []
        });
        
        // Set normalized results with categorized data
        setNormalizedResults({
          summary: processedResults[selectedCategories[0]]?.items || [],
          modelResponseTimes: {}, // Calculate across selected categories
          rawData: normalizedData,
          categorized: true
        });
      } else {
        // Standard mode normalization (existing logic)
        const normalizedData = await normalizeResults(rawResults);

        // Process each category with different limits for standard mode
        const processedIncumbent = processResults(normalizedData.incumbent, shortListCount);
        const processedRegional = processResults(normalizedData.regional, 5); 
        const processedInteresting = processResults(normalizedData.interesting, 3);
        const processedGraveyard = processResults(normalizedData.graveyard, 3);

        setCategorizedResults({
          incumbent: processedIncumbent.items || [],
          regional: processedRegional.items || [],
          interesting: processedInteresting.items || [],
          graveyard: processedGraveyard.items || []
        });

        setNormalizedResults({
          summary: processedIncumbent.items || processedIncumbent,
          modelResponseTimes: processedIncumbent.modelResponseTimes || {},
          rawData: normalizedData,
          categorized: true
        });

        // Calculate metrics only in test mode with control set
        if (testMode && controlSet && controlSet.competitors.length > 0) {
          // Normalize control set for comparison
          const normalizedControlSet = await normalizeResults({
            controlSet: {
              items: controlSet.competitors,
              category: 'control',
              error: null
            }
          });

          // Calculate metrics for each model
          const metrics = {};
          const normalizedControlSetCompetitors = new Set(normalizedControlSet.controlSet.items);

          Object.entries(normalizedData).forEach(([category, categoryData]) => {
            Object.entries(categoryData).forEach(([model, modelData]) => {
              if (!modelData || !modelData.items) return;

              const modelItems = new Set(modelData.items);
              let precisionMatches = 0;

              modelItems.forEach(item => {
                if (normalizedControlSetCompetitors.has(item)) {
                  precisionMatches++;
                }
              });

              const precision = modelItems.size > 0 
                ? precisionMatches / modelItems.size
                : 0;

              let recallMatches = 0;

              normalizedControlSetCompetitors.forEach(controlItem => {
                if (modelItems.has(controlItem)) {
                  recallMatches++;
                }
              });

              const recall = normalizedControlSetCompetitors.size > 0
                ? recallMatches / normalizedControlSetCompetitors.size
                : 0;

              // If this model already has metrics from another category, use the better values
              if (metrics[model]) {
                metrics[model] = {
                  precision: Math.max(metrics[model].precision, Math.round(precision * 100)),
                  recall: Math.max(metrics[model].recall, Math.round(recall * 100)),
                  itemCount: Math.max(metrics[model].itemCount, modelItems.size),
                  responseTime: metrics[model].responseTime
                };
              } else {
                metrics[model] = {
                  precision: Math.round(precision * 100),
                  recall: Math.round(recall * 100),
                  itemCount: modelItems.size,
                  responseTime: modelData.responseTime || 0
                };
              }
            });
          });

          setLlmMetrics(metrics);
          
          // Add normalized control set to normalized results
          setNormalizedResults(prev => ({
            ...prev,
            normalizedControlSet: {
              competitors: normalizedControlSet.controlSet.items
            }
          }));
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during normalization');
    } finally {
      setIsNormalizing(false);
    }
  };

  // Recalculate results based on selected models
  const handleRecalculate = async () => {
    if (!normalizedResults || !Object.keys(metricsModelSelection).length) return;
    
    setIsRecalculating(true);
    
    try {
      // Filter out deselected models
      const filteredRawData = {};
      Object.keys(normalizedResults.rawData).forEach(model => {
        if (metricsModelSelection[model]) {
          filteredRawData[model] = normalizedResults.rawData[model];
        }
      });
      
      // Check if we have any models left after filtering
      if (Object.keys(filteredRawData).length === 0) {
        throw new Error('At least one model must be selected for recalculation');
      }
      
      // Process the filtered results
      const recalculatedProcessed = processResults(filteredRawData, shortListCount);

      // Calculate new metrics if in test mode with control set
      const recalculatedMetrics = {};
      
      if (testMode && normalizedResults.normalizedControlSet) {
        const normalizedControlSetCompetitors = new Set(normalizedResults.normalizedControlSet.competitors);
        
        // Calculate metrics for each model
        Object.entries(filteredRawData).forEach(([model, modelData]) => {
          if (!modelData || !modelData.items) return;
          
          const modelItems = new Set(modelData.items);
          let precisionMatches = 0;
          
          modelItems.forEach(item => {
            if (normalizedControlSetCompetitors.has(item)) {
              precisionMatches++;
            }
          });
          
          const precision = modelItems.size > 0 
            ? precisionMatches / modelItems.size
            : 0;
          
          let recallMatches = 0;
          
          normalizedControlSetCompetitors.forEach(controlItem => {
            if (modelItems.has(controlItem)) {
              recallMatches++;
            }
          });
          
          const recall = normalizedControlSetCompetitors.size > 0
            ? recallMatches / normalizedControlSetCompetitors.size
            : 0;
          
          recalculatedMetrics[model] = {
            precision: Math.round(precision * 100),
            recall: Math.round(recall * 100),
            itemCount: modelItems.size,
            responseTime: llmMetrics[model]?.responseTime || 0
          };
        });
        
        // Add overall metrics for the recalculated short list
        const shortListItems = new Set(recalculatedProcessed.items ? recalculatedProcessed.items.map(item => item.item) : recalculatedProcessed.map(item => item.item));
        let overallPrecisionMatches = 0;
        
        shortListItems.forEach(item => {
          if (normalizedControlSetCompetitors.has(item)) {
            overallPrecisionMatches++;
          }
        });
        
        const overallPrecision = shortListItems.size > 0
          ? overallPrecisionMatches / shortListItems.size
          : 0;
        
        let overallRecallMatches = 0;
        normalizedControlSetCompetitors.forEach(controlItem => {
          if (shortListItems.has(controlItem)) {
            overallRecallMatches++;
          }
        });
        
        const overallRecall = normalizedControlSetCompetitors.size > 0
          ? overallRecallMatches / normalizedControlSetCompetitors.size
          : 0;
        
        // Add summary metrics
        recalculatedMetrics['overall'] = {
          precision: Math.round(overallPrecision * 100),
          recall: Math.round(overallRecall * 100),
          selectedModels: Object.keys(filteredRawData).length
        };
      }

      setRecalculatedResults({
        summary: recalculatedProcessed.items || recalculatedProcessed,
        rawData: filteredRawData,
        metrics: recalculatedMetrics
      });
    } catch (err) {
      setError(err.message || 'An error occurred during recalculation');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle toggling a model in the metrics panel
  const handleMetricsModelToggle = (model) => {
    setMetricsModelSelection(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
    // Reset recalculated results when selection changes
    setRecalculatedResults(null);
  };

  // Select/deselect all models
  const handleSelectAllMetricsModels = (select) => {
    const newSelection = {};
    Object.keys(llmMetrics).forEach(model => {
      newSelection[model] = select;
    });
    setMetricsModelSelection(newSelection);
    setRecalculatedResults(null);
  };

  // Add a function to handle starting a new company
  const handleNewCompany = () => {
    // Only proceed if we have normalized results
    if (!normalizedResults || !input) return;

    // Extract precision and recall metrics if available
    let metrics = {
      precision: 'N/A',
      recall: 'N/A'
    };

    // If we're in test mode and have a control set, use the evaluation metrics
    if (testMode && controlSet && normalizedResults && normalizedResults.normalizedControlSet && controlSet.competitors.length > 0) {
      const originalControlSetCompetitors = new Set(controlSet.competitors);
      const normalizedControlSetCompetitors = new Set(normalizedResults.normalizedControlSet.competitors);

      // --- Precision Calculation (Checks normalized control set against short list) ---
      const shortListItems = new Set(normalizedResults.summary.map(item => item.item));
      let precisionMatches = 0;
      shortListItems.forEach(item => {
        if (normalizedControlSetCompetitors.has(item)) {
          precisionMatches++;
        }
      });
      // Ensure denominator is not zero
      const precision = normalizedResults.summary.length > 0
        ? precisionMatches / normalizedResults.summary.length
        : 0;

      // --- Recall Calculation (Checks normalized control set against *all* normalized found items) ---
      // Get all unique *normalized* items found by any LLM from rawData
      const allFoundNormalizedItems = new Set();
      Object.values(normalizedResults.rawData).forEach(categoryData => {
        Object.values(categoryData).forEach(modelData => {
          if (modelData && modelData.items) {
            modelData.items.forEach(item => {
              if (item) allFoundNormalizedItems.add(item.trim()); // These are already normalized
            });
          }
        });
      });

      // Count how many *normalized* control set competitors are in the *all found normalized* items list
      let recallMatches = 0;
      normalizedControlSetCompetitors.forEach(normalizedControlCompetitor => {
        if (allFoundNormalizedItems.has(normalizedControlCompetitor)) {
          recallMatches++;
        }
      });

      // Recall = total matches found / total number of *original* control set items
      // Ensure denominator is not zero
      const recall = originalControlSetCompetitors.size > 0
         ? recallMatches / originalControlSetCompetitors.size
         : 0;

      // Format both metrics as percentages
      metrics = {
        precision: Math.round(precision * 100) + '%',
        recall: Math.round(recall * 100) + '%'
      };
    }

    // Save current company data
    setPreviousCompanies(prev => [...prev, {
      name: input,
      description: companyDescription,
      timestamp: new Date().toLocaleString(),
      testMode,
      reportMode,
      metrics // Use the calculated metrics
    }]);

    // Reset form for a new company
    setInput('');
    setCompanyDescription('');
    setRawResults(null);
    setNormalizedResults(null);
    setProgress({});
    setLlmMetrics({});
    setRecalculatedResults(null);
    setCompetitorReport(null);
    setShowCompetitorReport(false);

    // Reset control set for new company
    setControlSet(null);

    // Reset to default list counts and reset report mode settings if needed
    if (!testMode) {
      setLongListCount(20);
      setShortListCount(10);
    }
    
    // Keep the report mode settings but reset the region if not needed
    if (!reportMode || !selectedCategories.includes('regional')) {
      setSelectedRegion('');
    }

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleModelMetrics = () => {
    setShowModelMetrics(!showModelMetrics);
  };

  // Count how many models are selected in the metrics panel
  const countSelectedMetricsModels = () => {
    return Object.values(metricsModelSelection).filter(Boolean).length;
  };

  // Handle pre-processing the report
  const handlePreProcessReport = async () => {
    if (!normalizedResults || !categorizedResults) {
      setReportError('Please generate and normalize competitor results first');
      return;
    }
    
    setIsProcessingReport(true);
    setReportError(null);
    setReportProgress({});
    setShowReportResults(true);
    setShowCompetitorReport(false);
    
    try {
      const results = await preprocessReport(
        categorizedResults, 
        input, 
        companyDescription,
        (status, progress) => {
          setReportProgress({
            status,
            progress
          });
        }
      );
      
      setReportResults(results);
      setFilteredReportResults(results);
    } catch (err) {
      setReportError(err.message || 'An error occurred while processing the report');
    } finally {
      setIsProcessingReport(false);
    }
  };
  
  // Handle generating the competitor report
  const handleGenerateCompetitorReport = async () => {
    if (!filteredReportResults) {
      setReportError('Please pre-process report results first');
      return;
    }
    
    setIsGeneratingCompetitorReport(true);
    setReportError(null);
    setCompetitorReportProgress({});
    setShowCompetitorReport(true);
    setShowReportResults(false);
    
    try {
      const report = await generateCompetitorReport(
        filteredReportResults,
        input,
        companyDescription,
        (status, progress) => {
          setCompetitorReportProgress({
            status,
            progress
          });
        }
      );
      
      setCompetitorReport(report.reportContent);
    } catch (err) {
      setReportError(err.message || 'An error occurred while generating the competitor report');
      setShowCompetitorReport(false);
      setShowReportResults(true);
    } finally {
      setIsGeneratingCompetitorReport(false);
    }
  };

  // Handle saving the edited competitor report
  const handleSaveCompetitorReport = (updatedReport) => {
    setCompetitorReport(updatedReport);
  };
  
  // Handle updating report results when companies are removed
  const handleUpdateReportResults = (updatedResults) => {
    // Update the filtered results with the user-curated list
    setFilteredReportResults({
      ...filteredReportResults,
      results: updatedResults
    });
    
    // Count how many are left in each category
    const countByType = {
      incumbent: 0,
      regional: 0,
      interesting: 0,
      graveyard: 0
    };
    
    updatedResults.forEach(item => {
      if (item.type === 'Incumbent') countByType.incumbent++;
      else if (item.type === 'Regional') countByType.regional++;
      else if (item.type === 'Interesting') countByType.interesting++;
      else if (item.type === 'Graveyard') countByType.graveyard++;
    });
    
    // Update the stats
    const updatedStats = {
      incumbent: {
        total: filteredReportResults.stats.incumbent.total,
        valid: countByType.incumbent,
        invalid: filteredReportResults.stats.incumbent.total - countByType.incumbent
      },
      regional: {
        total: filteredReportResults.stats.regional.total,
        valid: countByType.regional,
        invalid: filteredReportResults.stats.regional.total - countByType.regional
      },
      interesting: {
        total: filteredReportResults.stats.interesting.total,
        valid: countByType.interesting,
        invalid: filteredReportResults.stats.interesting.total - countByType.interesting
      },
      graveyard: {
        total: filteredReportResults.stats.graveyard.total,
        valid: countByType.graveyard,
        invalid: filteredReportResults.stats.graveyard.total - countByType.graveyard
      }
    };
    
    setFilteredReportResults(prev => ({
      ...prev,
      stats: updatedStats
    }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ListyAI <span className="version-tag">v0.9.3</span></h1>
        <p className="app-description">
          Generate comprehensive competitor lists using multiple AI models
        </p>
      </header>

      {/* Error display for API Key issues */}
      {apiKeyStatus.checked && !apiKeyStatus.valid && (
        <ErrorDisplay message={apiKeyStatus.message || 'API key validation failed'} />
      )}

      {/* Input form */}
      <InputForm 
        input={input}
        setInput={setInput}
        companyDescription={companyDescription}
        setCompanyDescription={setCompanyDescription}
        longListCount={longListCount}
        setLongListCount={setLongListCount}
        shortListCount={shortListCount}
        setShortListCount={setShortListCount}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        fastMode={fastMode}
        setFastMode={setFastMode}
        testMode={testMode}
        setTestMode={setTestMode}
        controlSet={controlSet}
        setControlSet={setControlSet}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        reportMode={reportMode}
        setReportMode={setReportMode}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      {/* Previous Companies */}
      <PreviousCompanies 
        companies={previousCompanies}
        onSelect={handleNewCompany}
      />

      {/* Loading indicator */}
      {isLoading && <LoadingIndicator progress={progress} />}
      
      {/* Error display */}
      {error && <ErrorDisplay message={error} />}
      {reportError && <ErrorDisplay message={reportError} />}

      {/* Results section */}
      {rawResults && !isNormalizing && (
        <div className="normalization-section">
          <div className="normalization-header">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
            <div className="normalization-text">
              <h2>Raw Results Collected</h2>
              <p>Data collected from LLMs. Click below to normalize and find the most common items.</p>
            </div>
          </div>
          
          <button 
            onClick={handleNormalize} 
            disabled={isNormalizing} 
            className="normalize-button"
          >
            {isNormalizing ? (
              <>
                <span className="spinner-small"></span>
                Normalizing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6z"></path>
                  <path d="M12 13v9"></path>
                  <path d="M5 13v9"></path>
                  <path d="M19 13v9"></path>
                </svg>
                Normalize Results
              </>
            )}
          </button>
        </div>
      )}

      {/* Preprocessing Report Button */}
      {normalizedResults && !isProcessingReport && !showReportResults && !showCompetitorReport && (
        <div className="normalization-section">
          <div className="normalization-header">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
            </div>
            <div className="normalization-text">
              <h2>Results Normalized</h2>
              <p>Results have been normalized. Click below to generate a report with company summaries.</p>
            </div>
          </div>
          
          <button 
            onClick={handlePreProcessReport} 
            disabled={isProcessingReport}
            className="process-report-button"
          >
            {isProcessingReport ? (
              <>
                <span className="spinner-small"></span>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Pre-Process Report
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Generate Competitor Report Button */}
      {reportResults && !isGeneratingCompetitorReport && showReportResults && !showCompetitorReport && (
        <div className="normalization-section">
          <div className="normalization-header">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="normalization-text">
              <h2>Report Data Generated</h2>
              <p>Competitor data summarized. Click below to generate a comprehensive VC-style analysis report.</p>
            </div>
          </div>
          
          <button 
            onClick={handleGenerateCompetitorReport} 
            disabled={isGeneratingCompetitorReport}
            className="generate-report-button"
          >
            {isGeneratingCompetitorReport ? (
              <>
                <span className="spinner-small"></span>
                Generating VC Report...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Generate VC-Style Report
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Normalization indicator */}
      {isNormalizing && (
        <LoadingIndicator message="Normalizing results..." />
      )}

      {/* Report Processing indicator */}
      {isProcessingReport && (
        <div className="report-processing-container">
          <h3>Pre-Processing Report</h3>
          <div className="report-progress-status">
            {reportProgress.status === 'validating' && (
              <>
                <span className="progress-icon">🔍</span>
                <span>Validating companies with Google Gemini...</span>
              </>
            )}
            {reportProgress.status === 'summarizing' && (
              <>
                <span className="progress-icon">📝</span>
                <span>Generating company summaries...</span>
              </>
            )}
            {reportProgress.status === 'complete' && (
              <>
                <span className="progress-icon">✅</span>
                <span>Processing complete!</span>
              </>
            )}
          </div>
          <div className="report-progress-bar-container">
            <div 
              className="report-progress-bar" 
              style={{width: `${reportProgress.progress || 0}%`}}
            ></div>
          </div>
        </div>
      )}
      
      {/* Competitor Report Processing indicator */}
      {isGeneratingCompetitorReport && (
        <div className="report-processing-container">
          <h3>Generating VC-Style Competitor Report</h3>
          <div className="report-progress-status">
            {competitorReportProgress.status === 'generating' && (
              <>
                <span className="progress-icon">📊</span>
                <span>Using Google Gemini to analyze and generate report...</span>
              </>
            )}
            {competitorReportProgress.status === 'complete' && (
              <>
                <span className="progress-icon">✅</span>
                <span>Report generated successfully!</span>
              </>
            )}
          </div>
          <div className="report-progress-bar-container">
            <div 
              className="report-progress-bar" 
              style={{width: `${competitorReportProgress.progress || 0}%`}}
            ></div>
          </div>
        </div>
      )}

      {/* Show normalized results */}
      {normalizedResults && !showReportResults && !showCompetitorReport && (
        <div className="results-container">
          <ResultsTable 
            categorizedResults={categorizedResults}
            normalizedRawResults={normalizedResults.rawData}
            categoryInfo={{
              incumbent: { shortListCount: shortListCount },
              regional: { shortListCount: 5 },
              interesting: { shortListCount: 3 },
              graveyard: { shortListCount: 3 }
            }}
          />
        </div>
      )}
      
      {/* Report Results */}
      {showReportResults && filteredReportResults && !showCompetitorReport && (
        <>
          <ReportResultsTable 
            results={filteredReportResults.results}
            stats={filteredReportResults.stats}
            onUpdateResults={handleUpdateReportResults}
          />
          <div className="report-actions-container">
            <button 
              className="back-to-results-button"
              onClick={() => setShowReportResults(false)}
            >
              Back to Competitor Results
            </button>
          </div>
        </>
      )}
      
      {/* Competitor Report */}
      {showCompetitorReport && competitorReport && (
        <>
          <CompetitorReport
            reportContent={competitorReport}
            companyName={input}
            onSave={handleSaveCompetitorReport}
          />
          <div className="report-actions-container">
            <button 
              className="back-to-results-button"
              onClick={() => {
                setShowCompetitorReport(false);
                setShowReportResults(true);
              }}
            >
              Back to Report Results
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;