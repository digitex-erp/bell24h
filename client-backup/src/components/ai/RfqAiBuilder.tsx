import React from 'react';
import { useCopilot } from '@copilotkit/react-ui'; // Using hook from react-ui

export default function RfqAiBuilder() {
  const { status, sendMessage, response, inProgress } = useCopilot();

  // TODO: Implement UI and logic for RFQ generation
  // Example: form inputs, button to trigger sendMessage with a specific prompt for RFQ building

  return (
    <div>
      <h2>RFQ AI Builder</h2>
      <textarea placeholder="Describe your RFQ needs... (e.g., 1000 units of Grade A widgets, delivery by next month)" />
      <button onClick={() => sendMessage("Help me build an RFQ based on the following details: ...")}>Generate RFQ Draft</button>
      {inProgress && <p>AI is drafting the RFQ...</p>}
      {response && (
        <div>
          <h4>Generated RFQ Draft:</h4>
          <pre>{typeof response === 'object' ? JSON.stringify(response, null, 2) : response}</pre>
        </div>
      )}
    </div>
  );
}
