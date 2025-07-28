import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor, { OnMount, OnChange, OnValidate } from '@monaco-editor/react';
import { Box, useTheme, CircularProgress, Typography, Paper } from '@mui/material';
import { useCodeEditor } from '../../hooks/useCodeEditor';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import CodeSuggestions from './CodeSuggestions';
import { AZRCodeAnalysis, AZRCodeCompletion } from '../../services/azrCoderService';

export interface AZRCodeEditorProps {
  initialCode?: string;
  language?: string;
  filePath?: string;
  height?: string | number;
  width?: string | number;
  onChange?: (code: string) => void;
  onAnalysisComplete?: (analysis: AZRCodeAnalysis) => void;
  onError?: (error: Error) => void;
  showAnalysisPanel?: boolean;
  showSuggestionsPanel?: boolean;
  autoAnalyze?: boolean;
  theme?: 'light' | 'dark' | 'system';
  options?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const AZRCodeEditor: React.FC<AZRCodeEditorProps> = ({
  initialCode = '',
  language = 'typescript',
  filePath,
  height = '500px',
  width = '100%',
  onChange,
  onAnalysisComplete,
  onError,
  showAnalysisPanel = true,
  showSuggestionsPanel = true,
  autoAnalyze = true,
  theme: themeProp = 'system',
  options = {},
  className,
  style = {},
}) => {
  const theme = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AZRCodeAnalysis | null>(null);
  const [completions, setCompletions] = useState<AZRCodeCompletion | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number } | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  
  // Determine the editor theme based on the prop and system preference
  const editorTheme = themeProp === 'system' 
    ? theme.palette.mode === 'dark' ? 'vs-dark' : 'light'
    : themeProp === 'dark' ? 'vs-dark' : 'light';
  
  // Initialize the code editor hook
  const {
    code,
    updateCode,
    analyzeCode,
    getCodeCompletions,
    generateTests,
    refactorCode,
    generateDocumentation,
    isProcessing,
    error,
    clearError,
  } = useCodeEditor({
    initialCode,
    language,
    filePath,
    autoAnalyze,
    onCodeChange: onChange,
    onAnalysisComplete: (result) => {
      setAnalysis(result);
      onAnalysisComplete?.(result);
    },
    onError: (err) => {
      console.error('AZR Code Editor Error:', err);
      onError?.(err);
    },
  });

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsEditorReady(true);
    
    // Register custom commands and keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      const position = editor.getPosition();
      const model = editor.getModel();
      if (!model) return;
      
      // Get text until cursor position
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      
      // Get text after cursor position (for context)
      const textAfterPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: model.getLineCount(),
        endColumn: model.getLineMaxColumn(model.getLineCount()),
      });
      
      // Set the suggestion position near the cursor
      const cursorCoords = editor.getScrolledVisiblePosition(position);
      const editorCoords = editor.getDomNode()?.getBoundingClientRect();
      
      if (editorCoords) {
        setSuggestionPosition({
          top: (cursorCoords.top + editor.getLayoutInfo().horizontalScrollbarHeight) || 0,
          left: (cursorCoords.left + 30) || 0, // Offset to the right of the cursor
        });
      }
      
      // Get completions
      setSuggestionQuery(textUntilPosition);
      getCodeCompletions(textUntilPosition, textAfterPosition)
        .then((result) => {
          setCompletions(result);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(0);
        })
        .catch(console.error);
    });
    
    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      // Hide suggestions when cursor moves
      if (showSuggestions) {
        setShowSuggestions(false);
        setCompletions(null);
      }
    });
    
    // Handle content changes
    editor.onDidChangeModelContent((e) => {
      const position = editor.getPosition();
      if (!position) return;
      
      // Check if we should trigger completions (e.g., after typing a dot)
      const model = editor.getModel();
      if (!model) return;
      
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);
      
      // Simple trigger for demo purposes (e.g., after a dot)
      if (textUntilPosition.endsWith('.') || textUntilPosition.endsWith(' ')) {
        const textAfterPosition = lineContent.substring(position.column - 1);
        
        // Set the suggestion position near the cursor
        const cursorCoords = editor.getScrolledVisiblePosition(position);
        const editorCoords = editor.getDomNode()?.getBoundingClientRect();
        
        if (editorCoords) {
          setSuggestionPosition({
            top: (cursorCoords.top + editor.getLayoutInfo().horizontalScrollbarHeight) || 0,
            left: (cursorCoords.left + 30) || 0, // Offset to the right of the cursor
          });
        }
        
        // Get completions
        setSuggestionQuery(textUntilPosition);
        getCodeCompletions(textUntilPosition, textAfterPosition)
          .then((result) => {
            setCompletions(result);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(0);
          })
          .catch(console.error);
      }
    });
    
    // Handle keydown events for suggestions
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || !completions) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            Math.min(prev + 1, (completions.completions?.length || 1) - 1)
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
          break;
          
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && completions.completions?.[selectedSuggestionIndex]) {
            applySuggestion(completions.completions[selectedSuggestionIndex].text);
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          setCompletions(null);
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  // Apply a suggestion to the editor
  const applySuggestion = (suggestion: string) => {
    if (!editorRef.current) return;
    
    const position = editorRef.current.getPosition();
    const model = editorRef.current.getModel();
    if (!model) return;
    
    // Get the line content up to the cursor
    const lineContent = model.getLineContent(position.lineNumber);
    const textUntilPosition = lineContent.substring(0, position.column - 1);
    
    // Find the last word boundary (space, dot, etc.)
    const lastSpaceIndex = Math.max(
      textUntilPosition.lastIndexOf(' '),
      textUntilPosition.lastIndexOf('.'),
      textUntilPosition.lastIndexOf('('),
      textUntilPosition.lastIndexOf('{'),
      textUntilPosition.lastIndexOf('['),
      textUntilPosition.lastIndexOf(',')
    );
    
    // Calculate range to replace
    const startColumn = lastSpaceIndex === -1 ? 1 : lastSpaceIndex + 2;
    const endColumn = position.column;
    
    // Apply the edit
    editorRef.current.executeEdits('suggestion', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn,
        endLineNumber: position.lineNumber,
        endColumn,
      },
      text: suggestion,
      forceMoveMarkers: true,
    }]);
    
    // Hide suggestions
    setShowSuggestions(false);
    setCompletions(null);
  };
  
  // Handle editor content changes
  const handleEditorChange: OnChange = (value, event) => {
    if (value !== undefined) {
      updateCode(value);
    }
  };
  
  // Handle editor validation (for markers)
  const handleEditorValidation: OnValidate = (markers) => {
    // You can handle validation markers here if needed
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    applySuggestion(suggestion);
  };
  
  // Handle suggestion hover
  const handleSuggestionHover = (index: number) => {
    setSelectedSuggestionIndex(index);
  };
  
  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSuggestions && !(e.target as Element)?.closest('.suggestions-container')) {
        setShowSuggestions(false);
        setCompletions(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  return (
    <Box 
      className={className} 
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Editor Container */}
      <Box flex={1} position="relative">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={initialCode}
          theme={editorTheme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          onValidate={handleEditorValidation}
          loading={
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={40} />
            </Box>
          }
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            ...options,
          }}
        />
        
        {/* Loading overlay */}
        {isProcessing && (
          <Box
            position="absolute"
            top={0}
            right={0}
            p={1}
            bgcolor="background.paper"
            borderBottomLeftRadius={4}
            boxShadow={1}
            display="flex"
            alignItems="center"
            zIndex={10}
          >
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {isAnalyzing ? 'Analyzing...' : 'Processing...'}
            </Typography>
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={1}
            bgcolor="error.dark"
            color="error.contrastText"
            zIndex={10}
          >
            <Typography variant="caption">
              {error.message}
            </Typography>
            <IconButton 
              size="small" 
              color="inherit" 
              onClick={clearError}
              sx={{ position: 'absolute', right: 4, top: 4 }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        {/* Code Suggestions */}
        {showSuggestions && completions && suggestionPosition && (
          <Box
            className="suggestions-container"
            position="absolute"
            top={`${suggestionPosition.top}px`}
            left={`${suggestionPosition.left}px`}
            zIndex={1000}
            width="600px"
            maxHeight="400px"
            boxShadow={3}
            borderRadius={1}
            overflow="hidden"
          >
            <CodeSuggestions
              completions={completions}
              onSelect={handleSuggestionSelect}
              selectedIndex={selectedSuggestionIndex}
              onHover={handleSuggestionHover}
              maxHeight="400px"
            />
          </Box>
        )}
      </Box>
      
      {/* Analysis Panel */}
      {showAnalysisPanel && (
        <Box 
          flexShrink={0}
          borderTop={`1px solid ${theme.palette.divider}`}
          sx={{
            height: '200px',
            overflow: 'hidden',
            transition: 'height 0.3s ease',
          }}
        >
          <CodeAnalysisPanel 
            analysis={analysis} 
            isLoading={isProcessing && isAnalyzing}
            error={error}
            onSuggestionClick={(suggestion) => {
              // Navigate to the suggestion location in the editor
              if (editorRef.current && suggestion.line !== undefined) {
                editorRef.current.revealLineInCenter(suggestion.line);
                editorRef.current.setPosition({
                  lineNumber: suggestion.line,
                  column: 1,
                });
                editorRef.current.focus();
              }
              
              // If there's a recommended fix, apply it
              if (suggestion.recommendedFix) {
                const model = editorRef.current?.getModel();
                if (model && suggestion.line !== undefined) {
                  const lineContent = model.getLineContent(suggestion.line);
                  const indent = lineContent.match(/^\s*/)?.[0] || '';
                  const fixedCode = suggestion.recommendedFix
                    .split('\n')
                    .map((line, i) => (i > 0 ? indent + line : line))
                    .join('\n');
                  
                  editorRef.current?.executeEdits('suggestion', [{
                    range: {
                      startLineNumber: suggestion.line,
                      startColumn: 1,
                      endLineNumber: suggestion.line,
                      endColumn: lineContent.length + 1,
                    },
                    text: fixedCode,
                    forceMoveMarkers: true,
                  }]);
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AZRCodeEditor;
