import React from 'react';
import { useCopilot } from '@copilotkit/react-ui'; // Using hook from react-ui

export default function SupplierMatcher() {
  const { status, sendMessage, response, inProgress } = useCopilot();

  // TODO: Implement UI and logic for supplier matching
  // Example: input for RFQ details, button to trigger sendMessage for supplier matching

  return (
    <div>
      <h2>Supplier Matcher AI</h2>
      <textarea placeholder="Paste RFQ details or describe requirements to find suppliers..." />
      <button onClick={() => sendMessage("Find suitable suppliers for the following RFQ: ...")}>Match Suppliers</button>
      {inProgress && <p>AI is searching for suppliers...</p>}
      {response && (
        <div>
          <h4>Matched Suppliers:</h4>
          <pre>{typeof response === 'object' ? JSON.stringify(response, null, 2) : response}</pre>
        </div>
      )}
    </div>
  );
}
