import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import AZRCodeEditorDemo from '../components/ai/AZRCodeEditorDemo';
import { AZRCoderProvider } from '../contexts/AZRCoderContext';

const AZRCodeEditorPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AZRCoderProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            py: 3,
            px: { xs: 2, sm: 3 },
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h4" component="h1" gutterBottom={!isMobile}>
                  AZR Code Editor
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  AI-powered code editing with real-time analysis and suggestions
                </Typography>
              </Box>
              
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'primary.light',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                  <Typography variant="caption" color="primary.contrastText">
                    AI Assistant Active
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    <strong>Ctrl+Space</strong> for suggestions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Ctrl+Enter</strong> to analyze
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            py: 4,
            px: { xs: 2, sm: 3 },
            bgcolor: 'background.default',
          }}
        >
          <Container 
            maxWidth="xl" 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              px: { xs: 0, sm: 2 },
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <AZRCodeEditorDemo />
            </Box>
            
            {/* Features Section */}
            <Box mt={6} mb={4}>
              <Typography variant="h5" gutterBottom>
                Features
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 3,
                  mt: 3,
                }}
              >
                {[
                  {
                    title: 'AI-Powered Code Analysis',
                    description: 'Get real-time feedback on code quality, potential bugs, and performance issues with our advanced AI analysis.',
                    icon: '🧠',
                  },
                  {
                    title: 'Smart Code Completion',
                    description: 'Intelligent code suggestions powered by machine learning models trained on millions of lines of code.',
                    icon: '💡',
                  },
                  {
                    title: 'Automated Refactoring',
                    description: 'Let the AI suggest and apply refactoring to improve code quality and maintainability.',
                    icon: '⚡',
                  },
                  {
                    title: 'Documentation Generation',
                    description: 'Automatically generate comprehensive documentation for your code with a single click.',
                    icon: '📚',
                  },
                  {
                    title: 'Test Generation',
                    description: 'Generate unit tests for your code to ensure reliability and catch regressions early.',
                    icon: '🧪',
                  },
                  {
                    title: 'Multi-language Support',
                    description: 'Works with multiple programming languages including TypeScript, JavaScript, Python, and more.',
                    icon: '🌐',
                  },
                ].map((feature, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
            
            {/* Footer */}
            <Box mt={6} py={4} borderTop={`1px solid ${theme.palette.divider}`}>
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} AZR Code Editor. Powered by AZR-CODER-7B AI.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </AZRCoderProvider>
  );
};

export default AZRCodeEditorPage;
