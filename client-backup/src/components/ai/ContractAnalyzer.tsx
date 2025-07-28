import React from 'react';
import { useCopilot } from '@copilotkit/react-ui'; // Using hook from react-ui

export default function ContractAnalyzer() {
  const { status, sendMessage, response, inProgress } = useCopilot();

  // TODO: Implement UI and logic for contract analysis
  // Example: textarea for contract text, button to trigger sendMessage for analysis

  return (
    <div>
      <h2>Contract Analyzer AI</h2>
      <textarea placeholder="Paste contract text here for analysis..." rows={10} />
      <button onClick={() => sendMessage("Analyze the following contract for risks and suggestions: ...")}>Analyze Contract</button>
      {inProgress && <p>AI is analyzing the contract...</p>}
      {response && (
        <div>
          <h4>Contract Analysis:</h4>
          <pre>{typeof response === 'object' ? JSON.stringify(response, null, 2) : response}</pre>
        </div>
      )}
    </div>
  );
}
