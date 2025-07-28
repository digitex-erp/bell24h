import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Typography, useTheme } from '@mui/material';
import { detectLanguage } from '../../utils/codeUtils';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  maxHeight?: string | number;
  wrapLines?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language: propLanguage,
  showLineNumbers = true,
  showCopyButton = true,
  maxHeight = '400px',
  wrapLines = true,
  style = {},
  title,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [copied, setCopied] = React.useState(false);
  
  // Detect language if not provided
  const language = propLanguage || detectLanguage(code);
  
  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: 1,
        ...style,
      }}
    >
      {/* Header with title and copy button */}
      {(title || showCopyButton) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
            px: 2,
            py: 1,
            borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          }}
        >
          {title && (
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>
          )}
          {showCopyButton && (
            <Box>
              <Typography
                variant="caption"
                onClick={handleCopy}
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Typography>
              {language && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.5,
                    bgcolor: isDarkMode ? '#2d2d2d' : '#e0e0e0',
                    borderRadius: 1,
                    color: isDarkMode ? '#fff' : 'text.primary',
                  }}
                >
                  {language}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
      
      {/* Code block */}
      <Box
        sx={{
          maxHeight,
          overflow: 'auto',
          '& pre': {
            margin: 0,
            borderRadius: 0,
            '& code': {
              fontFamily: '\"Fira Code\", \"Fira Mono\", Menlo, Monaco, Consolas, \"Courier New\", monospace',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            },
          },
        }}
      >
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? vscDarkPlus : vs}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          customStyle={{
            margin: 0,
            padding: '16px',
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            color: isDarkMode ? '#858585' : '#999',
            paddingRight: '1em',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};

export default CodeBlock;
