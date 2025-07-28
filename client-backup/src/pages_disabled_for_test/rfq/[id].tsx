import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { lazyImport } from '@/utils/lazyImport'; // Path relative to client/src

// Dynamically import the ExplainabilityPanel
const ExplainabilityPanel = lazyImport('components/ai/ExplainabilityPanel');

const RfqDetailPage: React.FC = () => {
  const router = useRouter();
  const { id: rfqId } = router.query;

  if (router.isFallback || !rfqId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading RFQ details...</Typography>
      </Box>
    );
  }

  // Ensure rfqId is a string if it's an array (though typically it's a string for [id].tsx)
  const currentRfqId = Array.isArray(rfqId) ? rfqId[0] : rfqId;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        RFQ Details: {currentRfqId}
      </Typography>
      
      <Suspense 
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Explainability Panel...</Typography>
          </Box>
        }
      >
        {/* Pass the rfqId to the ExplainabilityPanel */}
        <ExplainabilityPanel rfqId={currentRfqId} />
      </Suspense>
      
      {/* Other RFQ details can be rendered here */}
    </Box>
  );
};

export default RfqDetailPage;
