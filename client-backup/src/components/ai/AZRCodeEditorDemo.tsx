import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  Code as CodeIcon, 
  BugReport as BugReportIcon, 
  AutoFixHigh as AutoFixHighIcon, 
  Description as DescriptionIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  FileCopy as FileCopyIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  SettingsEthernet as SettingsEthernetIcon,
  Tune as TuneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FormatIndentIncrease as FormatIndentIncreaseIcon,
  FormatIndentDecrease as FormatIndentDecreaseIcon,
  WrapText as WrapTextIcon,
  Keyboard as KeyboardIcon,
  HelpOutline as HelpOutlineIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import AZRCodeEditor from './AZRCodeEditor';
import CodeBlock from './CodeBlock';
import { AZRCodeAnalysis } from '../../services/azrCoderService';

// Sample code examples
const CODE_EXAMPLES = [
  {
    name: 'React Component',
    language: 'typescript',
    code: `import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));
  
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

export default Counter;`
  },
  {
    name: 'API Service',
    language: 'typescript',
    code: `import axios from 'axios';

const API_BASE_URL = 'https://api.example.com';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

class UserService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get<{ users: User[] }>(\`\${API_BASE_URL}/users\`);
      return response.data.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
  
  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const response = await axios.post<User>(\`\${API_BASE_URL}/users\`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }
  
  static async updateUser(id: number, updates: Partial<User>): Promise<User> {
    try {
      const response = await axios.patch<User>(\`\${API_BASE_URL}/users/\${id}\`, updates);
      return response.data;
    } catch (error) {
      console.error(\`Failed to update user \${id}:\`, error);
      throw error;
    }
  }
  
  static async deleteUser(id: number): Promise<void> {
    try {
      await axios.delete(\`\${API_BASE_URL}/users/\${id}\\n    } catch (error) {
      console.error(\`Failed to delete user \${id}:\`, error);
      throw error;
    }
  }
}

export default UserService;`
  },
  {
    name: 'Utility Functions',
    language: 'typescript',
    code: `/**
 * Formats a date string into a human-readable format
 * @param date - The date to format (can be a Date object or ISO string)
 * @param options - Formatting options
 * @returns Formatted date string
 */
function formatDate(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Debounces a function call
 * @param func - The function to debounce
 * @param wait - The delay in milliseconds
 * @returns A debounced version of the function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Deep clones an object
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  
  return result as T;
}

export { formatDate, debounce, deepClone };`
  }
];

const AZRCodeEditorDemo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState(CODE_EXAMPLES[0].code);
  const [language, setLanguage] = useState(CODE_EXAMPLES[0].language);
  const [analysis, setAnalysis] = useState<AZRCodeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCode(CODE_EXAMPLES[newValue].code);
    setLanguage(CODE_EXAMPLES[newValue].language);
    setAnalysis(null);
  };
  
  // Handle code change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  // Handle analysis complete
  const handleAnalysisComplete = (result: AZRCodeAnalysis) => {
    setAnalysis(result);
    setIsAnalyzing(false);
  };
  
  // Handle analyze click
  const handleAnalyze = () => {
    setIsAnalyzing(true);
  };
  
  // Handle refactor click
  const handleRefactor = () => {
    // Implementation for refactoring code
  };
  
  // Handle generate docs click
  const handleGenerateDocs = () => {
    // Implementation for generating documentation
  };
  
  // Handle settings menu open
  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  
  // Handle settings menu close
  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };
  
  // Toggle fullscreen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Toggle analysis panel
  const toggleAnalysisPanel = () => {
    setShowAnalysis(!showAnalysis);
  };
  
  // Toggle suggestions panel
  const toggleSuggestionsPanel = () => {
    setShowSuggestions(!showSuggestions);
  };
  
  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };
  
  // Download code as file
  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: 'background.default',
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <AppBar 
        position="static" 
        color="default" 
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 500 }}>
            AZR Code Editor
          </Typography>
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTabs-scrollButtons': {
                width: 32,
              },
            }}
          >
            {CODE_EXAMPLES.map((example, index) => (
              <Tab 
                key={index} 
                label={example.name} 
                icon={<CodeIcon fontSize="small" />} 
                iconPosition="start"
                sx={{ minHeight: 48, fontSize: '0.75rem' }}
              />
            ))}
          </Tabs>
          
          <Box flexGrow={1} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Analyze Code">
              <span>
                <Button
                  size="small"
                  startIcon={isAnalyzing ? <CircularProgress size={16} /> : <BugReportIcon />}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  sx={{ minWidth: 'auto' }}
                >
                  {isMobile ? '' : 'Analyze'}
                </Button>
              </span>
            </Tooltip>
            
            <Tooltip title="Refactor Code">
              <span>
                <Button
                  size="small"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleRefactor}
                  disabled={isAnalyzing}
                  sx={{ minWidth: 'auto' }}
                >
                  {isMobile ? '' : 'Refactor'}
                </Button>
              </span>
            </Tooltip>
            
            <Tooltip title="Generate Documentation">
              <span>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={handleGenerateDocs}
                  disabled={isAnalyzing}
                  sx={{ minWidth: 'auto' }}
                >
                  {isMobile ? '' : 'Docs'}
                </Button>
              </span>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <Tooltip title="Copy Code">
              <IconButton size="small" onClick={copyToClipboard}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download Code">
              <IconButton size="small" onClick={downloadCode}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <Tooltip title="Toggle Analysis Panel">
              <IconButton 
                size="small" 
                onClick={toggleAnalysisPanel}
                color={showAnalysis ? 'primary' : 'default'}
              >
                {showAnalysis ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Toggle Fullscreen">
              <IconButton 
                size="small" 
                onClick={toggleFullScreen}
              >
                {isFullScreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton 
                size="small" 
                onClick={handleSettingsMenuOpen}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          toggleAnalysisPanel();
          handleSettingsMenuClose();
        }}>
          <ListItemIcon>
            {showAnalysis ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{showAnalysis ? 'Hide Analysis' : 'Show Analysis'}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          toggleSuggestionsPanel();
          handleSettingsMenuClose();
        }}>
          <ListItemIcon>
            {showSuggestions ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleSettingsMenuClose}>
          <ListItemIcon>
            <TuneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editor Settings</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettingsMenuClose}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help & Shortcuts</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Editor */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <AZRCodeEditor
            initialCode={code}
            language={language}
            height="100%"
            width="100%"
            onChange={handleCodeChange}
            onAnalysisComplete={handleAnalysisComplete}
            showAnalysisPanel={showAnalysis}
            showSuggestionsPanel={showSuggestions}
          />
        </Box>
        
        {/* Analysis Panel (optional) */}
        {showAnalysis && analysis && (
          <Box sx={{ height: '250px', borderTop: `1px solid ${theme.palette.divider}` }}>
            <CodeBlock 
              code={JSON.stringify(analysis, null, 2)} 
              language="json" 
              title="Analysis Results"
              maxHeight="100%"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AZRCodeEditorDemo;
