import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { AZRCoderProvider } from '../../../contexts/AZRCoderContext';
import { AZREditorDemo } from '../../components/ai/AZREditor';

const AZREditorPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          AZR-CODER-7B Code Editor
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          A powerful code editor with AI-powered code analysis, completions, test generation, refactoring, and documentation.
        </Typography>
      </Box>
      
      <AZRCoderProvider>
        <AZREditorDemo />
      </AZRCoderProvider>
    </Container>
  );
};

export default AZREditorPage;
