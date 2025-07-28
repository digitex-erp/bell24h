import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAZRCoder } from '../../../contexts/AZRCoderContext';
import { AZRCodeAnalysis, AZRCodeCompletion, AZRTestGeneration } from '../../../services/azrCoderService';

interface AZREditorProps {
  initialCode?: string;
  language?: string;
  filePath?: string;
  onCodeChange?: (code: string) => void;
  height?: string | number;
  width?: string | number;
  showControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const AZREditor: React.FC<AZREditorProps> = ({
  initialCode = '',
  language,
  filePath,
  onCodeChange,
  height = '500px',
  width = '100%',
  showControls = true,
  className = '',
  style = {},
}) => {
  const [code, setCode] = useState(initialCode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'completions' | 'tests' | 'refactor' | 'documentation'>('code');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AZRCodeAnalysis | null>(null);
  const [completions, setCompletions] = useState<AZRCodeCompletion | null>(null);
  const [tests, setTests] = useState<AZRTestGeneration | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<{ documentation: string; examples?: string[] } | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  const {
    analyzeCode: analyzeWithAZR,
    getCodeCompletions: getCompletionsFromAZR,
    generateTests: generateTestsWithAZR,
    refactorCode: refactorWithAZR,
    generateDocumentation: generateDocsWithAZR,
    isAnalyzing: isAZRAnalyzing,
    error: azrError,
    clearError,
  } = useAZRCoder();

  // Handle code changes with debounce
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode);
    
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set a new timer
    debounceTimer.current = setTimeout(() => {
      // Auto-analyze on code change
      if (activeTab === 'analysis') {
        handleAnalyzeCode(newCode);
      }
    }, 1000); // 1 second debounce
  };

  // Analyze code
  const handleAnalyzeCode = async (codeToAnalyze: string = code) => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeWithAZR(codeToAnalyze, filePath);
      setAnalysis(result);
      return result;
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get code completions
  const handleGetCompletions = async () => {
    if (!editorRef.current) return;
    
    const cursorPos = editorRef.current.selectionStart || 0;
    const prefix = code.slice(0, cursorPos);
    const suffix = code.slice(cursorPos);
    
    try {
      setIsAnalyzing(true);
      const result = await getCompletionsFromAZR(prefix, suffix);
      setCompletions(result);
      setActiveTab('completions');
      return result;
    } catch (error) {
      console.error('Error getting completions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate tests
  const handleGenerateTests = async () => {
    try {
      setIsAnalyzing(true);
      const result = await generateTestsWithAZR(code);
      setTests(result);
      setActiveTab('tests');
      return result;
    } catch (error) {
      console.error('Error generating tests:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Refactor code
  const handleRefactorCode = async () => {
    try {
      setIsAnalyzing(true);
      const result = await refactorWithAZR(code);
      setRefactoredCode(result.refactored);
      setActiveTab('refactor');
      return result;
    } catch (error) {
      console.error('Error refactoring code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate documentation
  const handleGenerateDocumentation = async () => {
    try {
      setIsAnalyzing(true);
      const result = await generateDocsWithAZR(code);
      setDocumentation(result);
      setActiveTab('documentation');
      return result;
    } catch (error) {
      console.error('Error generating documentation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply a completion
  const applyCompletion = (completionText: string) => {
    if (!editorRef.current) return code;
    
    const cursorPos = editorRef.current.selectionStart || 0;
    const beforeCursor = code.slice(0, cursorPos);
    const afterCursor = code.slice(cursorPos);
    
    const newCode = beforeCursor + completionText + afterCursor;
    setCode(newCode);
    onCodeChange?.(newCode);
    
    // Move cursor to the end of the inserted text
    setTimeout(() => {
      if (editorRef.current) {
        const newCursorPos = cursorPos + completionText.length;
        editorRef.current.focus();
        editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
    
    return newCode;
  };

  // Apply refactoring
  const applyRefactoring = () => {
    if (!refactoredCode) return code;
    
    setCode(refactoredCode);
    onCodeChange?.(refactoredCode);
    setRefactoredCode(null);
    setActiveTab('code');
    
    return refactoredCode;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Space for code completions
    if (e.ctrlKey && e.key === ' ') {
      e.preventDefault();
      handleGetCompletions();
    }
    // Ctrl+Enter to analyze code
    else if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyzeCode();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Render the editor UI
  return (
    <div 
      className={`azr-editor ${className}`} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        width,
        ...style,
      }}
    >
      {/* Toolbar */}
      {showControls && (
        <div className="azr-toolbar" style={{
          padding: '8px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <button 
            onClick={() => handleAnalyzeCode()}
            disabled={isAnalyzing}
            title="Analyze code (Ctrl+Enter)"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
          
          <button 
            onClick={handleGetCompletions}
            disabled={isAnalyzing}
            title="Get code completions (Ctrl+Space)"
          >
            Complete
          </button>
          
          <button 
            onClick={handleGenerateTests}
            disabled={isAnalyzing}
            title="Generate tests"
          >
            Generate Tests
          </button>
          
          <button 
            onClick={handleRefactorCode}
            disabled={isAnalyzing}
            title="Refactor code"
          >
            Refactor
          </button>
          
          <button 
            onClick={handleGenerateDocumentation}
            disabled={isAnalyzing}
            title="Generate documentation"
          >
            Document
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Code editor */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: activeTab !== 'code' ? '1px solid #e0e0e0' : 'none',
          minWidth: activeTab !== 'code' ? '50%' : '100%',
          transition: 'all 0.3s ease',
        }}>
          <textarea
            ref={editorRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: '#fff',
              color: '#333',
            }}
            spellCheck="false"
            placeholder="Start typing your code here..."
          />
        </div>
        
        {/* Analysis panel */}
        {activeTab !== 'code' && (
          <div style={{
            flex: 1,
            padding: '16px',
            overflow: 'auto',
            backgroundColor: '#f9f9f9',
          }}>
            {activeTab === 'analysis' && (
              <div>
                <h3>Code Analysis</h3>
                {isAnalyzing ? (
                  <div>Analyzing code...</div>
                ) : analysis ? (
                  <div>
                    <h4>Metrics</h4>
                    <pre>{JSON.stringify(analysis.metrics, null, 2)}</pre>
                    <h4>Suggestions ({analysis.suggestions.length})</h4>
                    <ul>
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index}>
                          <strong>{suggestion.type}</strong> ({suggestion.severity}): {suggestion.message}
                          {suggestion.recommendedFix && (
                            <div>
                              <strong>Fix:</strong> {suggestion.recommendedFix}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>No analysis available. Click "Analyze" to get started.</div>
                )}
              </div>
            )}
            
            {activeTab === 'completions' && (
              <div>
                <h3>Code Completions</h3>
                {isAnalyzing ? (
                  <div>Generating completions...</div>
                ) : completions?.completions.length ? (
                  <div>
                    <ul>
                      {completions.completions.map((completion, index) => (
                        <li 
                          key={index} 
                          style={{
                            cursor: 'pointer',
                            padding: '8px',
                            backgroundColor: selectedSuggestion === index ? '#e3f2fd' : 'transparent',
                            borderRadius: '4px',
                            marginBottom: '4px',
                          }}
                          onClick={() => {
                            setSelectedSuggestion(index);
                            applyCompletion(completion.text);
                          }}
                        >
                          <div style={{ fontFamily: 'monospace', marginBottom: '4px' }}>
                            {completion.text}
                          </div>
                          {completion.docstring && (
                            <div style={{ fontSize: '0.9em', color: '#666' }}>
                              {completion.docstring}
                            </div>
                          )}
                          <div style={{ fontSize: '0.8em', color: '#888' }}>
                            Score: {completion.score.toFixed(2)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>No completions available. Try getting suggestions for your code.</div>
                )}
              </div>
            )}
            
            {activeTab === 'tests' && (
              <div>
                <h3>Generated Tests</h3>
                {isAnalyzing ? (
                  <div>Generating tests...</div>
                ) : tests ? (
                  <div>
                    <h4>Test Code ({tests.testFramework})</h4>
                    <pre style={{
                      backgroundColor: '#f0f0f0',
                      padding: '12px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px',
                    }}>
                      {tests.testCode}
                    </pre>
                    
                    <div style={{ marginTop: '16px' }}>
                      <h4>Test Cases ({tests.testCases.length})</h4>
                      <ul>
                        {tests.testCases.map((testCase, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>
                            <div><strong>Description:</strong> {testCase.description}</div>
                            <div><strong>Input:</strong> {JSON.stringify(testCase.input)}</div>
                            <div><strong>Expected:</strong> {JSON.stringify(testCase.expected)}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>No tests generated yet. Click "Generate Tests" to create test cases.</div>
                )}
              </div>
            )}
            
            {activeTab === 'refactor' && (
              <div>
                <h3>Refactored Code</h3>
                {isAnalyzing ? (
                  <div>Refactoring code...</div>
                ) : refactoredCode ? (
                  <div>
                    <pre style={{
                      backgroundColor: '#f0f0f0',
                      padding: '12px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '400px',
                    }}>
                      {refactoredCode}
                    </pre>
                    <div style={{ marginTop: '16px' }}>
                      <button 
                        onClick={applyRefactoring}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Apply Refactoring
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>No refactoring suggestions available. Click "Refactor" to get suggestions.</div>
                )}
              </div>
            )}
            
            {activeTab === 'documentation' && (
              <div>
                <h3>Documentation</h3>
                {isAnalyzing ? (
                  <div>Generating documentation...</div>
                ) : documentation ? (
                  <div>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      backgroundColor: '#f0f0f0',
                      padding: '12px',
                      borderRadius: '4px',
                      maxHeight: '400px',
                      overflow: 'auto',
                    }}>
                      {documentation.documentation}
                    </pre>
                    
                    {documentation.examples?.length ? (
                      <div style={{ marginTop: '16px' }}>
                        <h4>Examples</h4>
                        {documentation.examples.map((example, index) => (
                          <pre 
                            key={index}
                            style={{
                              backgroundColor: '#f0f0f0',
                              padding: '12px',
                              borderRadius: '4px',
                              marginBottom: '8px',
                              overflow: 'auto',
                            }}
                          >
                            {example}
                          </pre>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>No documentation generated yet. Click "Document" to generate documentation.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <div style={{
        padding: '4px 8px',
        backgroundColor: '#f0f0f0',
        borderTop: '1px solid #e0e0e0',
        fontSize: '12px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <div>
          {language && <span>Language: {language}</span>}
          {filePath && <span style={{ marginLeft: '16px' }}>File: {filePath}</span>}
        </div>
        <div>
          {isAnalyzing && <span>Processing...</span>}
          {azrError && <span style={{ color: 'red' }}>Error: {azrError.message}</span>}
        </div>
      </div>
    </div>
  );
};

export default AZREditor;
